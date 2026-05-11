import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import redis from "@/lib/redis";
import { rateLimit } from "@/lib/rate-limit";

const VIEWING_TTL_SECONDS = 60;
const COUNT_DEDUP_TTL_SECONDS = 60 * 30;

function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") || "127.0.0.1";
}

/**
 * GET — read total views + currently-viewing count.
 * Total is authoritative in Postgres; live count is a Redis SET size with TTL.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const product = await db.product.findFirst({
      where: { slug, inStock: true, isDeleted: false },
      select: { viewCount: true },
    });
    if (!product) {
      return NextResponse.json({ total: 0, viewing: 0 });
    }

    let viewing = 0;
    try {
      // Drop expired members first so the count reflects only fresh heartbeats.
      const cutoff = Date.now() - VIEWING_TTL_SECONDS * 1000;
      await redis.zremrangebyscore(`product:viewing:${slug}`, 0, cutoff);
      viewing = await redis.zcard(`product:viewing:${slug}`);
    } catch {
      // Redis down — fall back to 0 silently.
    }

    return NextResponse.json({ total: product.viewCount, viewing });
  } catch (err) {
    console.error("[products/views GET]", err);
    return NextResponse.json({ total: 0, viewing: 0 });
  }
}

/**
 * POST — heartbeat from the detail page.
 *  - Adds the session to the live ZSET (score = now).
 *  - Increments the persistent counter at most once per session per 30 min.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const ip = clientIp(request.headers);
  const limited = await rateLimit(`pv:${ip}:${slug}`, 30, 60);
  if (!limited.success) {
    return NextResponse.json({ ok: true });
  }

  const body = await request.json().catch(() => null);
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId.slice(0, 128) : "";
  if (!sessionId) {
    return NextResponse.json({ ok: true });
  }

  let shouldIncrement = false;
  try {
    await redis.zadd(`product:viewing:${slug}`, Date.now(), sessionId);
    await redis.expire(`product:viewing:${slug}`, VIEWING_TTL_SECONDS * 2);

    // Count this session only once per dedup window.
    const dedup = await redis.set(
      `product:viewed:${slug}:${sessionId}`,
      "1",
      "EX",
      COUNT_DEDUP_TTL_SECONDS,
      "NX"
    );
    shouldIncrement = dedup !== null;
  } catch {
    // No Redis — best-effort: count every heartbeat (rate-limit caps abuse).
    shouldIncrement = true;
  }

  if (shouldIncrement) {
    try {
      await db.product.updateMany({
        where: { slug, isDeleted: false },
        data: { viewCount: { increment: 1 } },
      });
    } catch (err) {
      console.error("[products/views POST]", err);
    }
  }

  return NextResponse.json({ ok: true });
}
