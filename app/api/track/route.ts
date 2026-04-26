import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import redis from "@/lib/redis";

const KNOWN_EVENTS = new Set([
  "page_view",
  "search",
  "filter_category",
  "filter_price",
  "ai_recommend",
  "click_product",
  "click_zalo",
  "click_call",
  "page_change",
  "chatbot_open",
  "chatbot_step",
  "chatbot_complete",
  "chatbot_drop",
]);

const METADATA_MAX_BYTES = 4096;
const DEDUP_WINDOW_SECONDS = 5;

function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") || "127.0.0.1";
}

/**
 * Accepts only plain (non-array) objects. Truncates to METADATA_MAX_BYTES
 * before storing so that a misbehaving client cannot bloat the DB.
 */
function sanitizeMetadata(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const obj = value as Record<string, unknown>;
  const serialized = JSON.stringify(obj);
  if (serialized.length <= METADATA_MAX_BYTES) return obj;
  return { _truncated: true, preview: serialized.slice(0, 200) };
}

/**
 * Per-event dedup discriminator. The goal is to reject *true* duplicates
 * (back-to-back keepalive retries, double-fired effects, browser back/forward)
 * without collapsing distinct user actions. We hash the axis that distinguishes
 * meaningfully different events so e.g. header_zalo + footer_zalo within 5 s
 * are both recorded.
 */
function dedupAxis(event: string, productId: number | null, metadata: unknown): string {
  const meta = (metadata && typeof metadata === "object" && !Array.isArray(metadata))
    ? (metadata as Record<string, unknown>)
    : {};
  const get = (key: string) => (typeof meta[key] === "string" ? (meta[key] as string) : "");

  switch (event) {
    case "page_view":
    case "page_change":
      return `path=${get("path")}`;
    case "click_zalo":
      return `src=${get("source")}|phone=${get("phone")}`;
    case "click_call":
      return `src=${get("source")}|phone=${get("phone")}`;
    case "click_product":
      return `pid=${productId ?? ""}|slug=${get("slug")}`;
    case "search":
      return `q=${get("query")}`;
    case "filter_category":
      return `cat=${get("category")}`;
    case "filter_price":
      return `range=${get("range")}`;
    case "ai_recommend":
      return `preset=${get("preset")}`;
    case "page_change":
      return `page=${typeof meta.page === "number" ? meta.page : ""}`;
    case "chatbot_open":
    case "chatbot_step":
    case "chatbot_complete":
    case "chatbot_drop":
      return `step=${get("step")}|intent=${get("intent")}`;
    default:
      return `pid=${productId ?? "_"}`;
  }
}

/**
 * Returns true when an identical event has already been recorded inside the
 * dedup window. Distinct events (different source / path / query / pid) are
 * NEVER collapsed. Fails open if Redis is unreachable.
 */
async function isDuplicate(
  sessionId: string,
  event: string,
  productId: number | null,
  metadata: unknown
): Promise<boolean> {
  try {
    const axis = dedupAxis(event, productId, metadata).slice(0, 256);
    const key = `track:dedup:${sessionId}:${event}:${axis}`;
    // SET key value NX EX ttl — atomic "set if absent" with TTL.
    const set = await redis.set(key, "1", "EX", DEDUP_WINDOW_SECONDS, "NX");
    return set === null;
  } catch (err) {
    console.error(JSON.stringify({ module: "TrackDedup", error: String(err) }));
    return false;
  }
}

export async function POST(request: NextRequest) {
  // Tracking must never block UI — always return 200.
  try {
    const ip = clientIp(request.headers);
    const limited = await rateLimit(`track:${ip}`, 60, 60);
    if (!limited.success) {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: true });

    const { event, sessionId, productId, metadata } = body as Record<string, unknown>;

    if (
      typeof event !== "string" ||
      !event ||
      typeof sessionId !== "string" ||
      !sessionId
    ) {
      return NextResponse.json({ ok: true });
    }

    if (!KNOWN_EVENTS.has(event)) {
      return NextResponse.json({ ok: true });
    }

    const normalizedProductId =
      typeof productId === "number" && Number.isFinite(productId) ? productId : null;
    const safeSessionId = sessionId.slice(0, 128);

    if (await isDuplicate(safeSessionId, event, normalizedProductId, metadata)) {
      return NextResponse.json({ ok: true });
    }

    const cleanMetadata = sanitizeMetadata(metadata);
    await db.trackingLog.create({
      data: {
        event,
        sessionId: safeSessionId,
        productId: normalizedProductId,
        metadata: (cleanMetadata ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        userAgent: (request.headers.get("user-agent") ?? "").slice(0, 512) || null,
      },
    });
  } catch (err) {
    // Swallow all errors — tracking failures must not surface to the client.
    // Log for server-side observability (visible in PM2 logs / `pm2 logs`).
    console.error("[track] Failed to persist tracking event:", err);
  }

  return NextResponse.json({ ok: true });
}
