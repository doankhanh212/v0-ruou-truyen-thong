import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import redis from "@/lib/redis";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/admin-rate-limit";

const VIEWING_TTL_SECONDS = 60;
const COUNT_DEDUP_TTL_SECONDS = 60 * 30;

// Constrain slug to the same charset Prisma slugify produces. This stops an
// attacker from rotating through arbitrary `slug` values to bypass per-slug
// rate limiting (the per-IP global guard below covers that case anyway).
const SLUG_PATTERN = /^[a-z0-9-]{1,80}$/;
const SESSION_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

/**
 * GET — read total views + currently-viewing count.
 * Total is authoritative in Postgres; live count is a Redis SET size with TTL.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ total: 0, viewing: 0 });
  }

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
  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ ok: true });
  }

  const ip = clientIp(request);

  // Two-layer rate limiting:
  //  - Per-IP global: caps total heartbeats across all slugs (defends against
  //    an attacker rotating the slug to bypass per-slug limits).
  //  - Per-IP+slug:   2 heartbeats / 30s is the natural cadence, so 4/min is
  //    a generous ceiling.
  const ipLimit = await rateLimit(`pv:ip:${ip}`, 60, 60);
  if (!ipLimit.success) return NextResponse.json({ ok: true });

  const pairLimit = await rateLimit(`pv:pair:${ip}:${slug}`, 4, 60);
  if (!pairLimit.success) return NextResponse.json({ ok: true });

  const body = await request.json().catch(() => null);
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
  if (!SESSION_PATTERN.test(sessionId)) {
    return NextResponse.json({ ok: true });
  }

  let shouldIncrement = false;
  try {
    // Dedup key includes IP — rotating sessionId alone cannot inflate counter.
    const memberId = `${ip}:${sessionId}`;
    await redis.zadd(`product:viewing:${slug}`, Date.now(), memberId);
    await redis.expire(`product:viewing:${slug}`, VIEWING_TTL_SECONDS * 2);

    const dedup = await redis.set(
      `product:viewed:${slug}:${memberId}`,
      "1",
      "EX",
      COUNT_DEDUP_TTL_SECONDS,
      "NX"
    );
    shouldIncrement = dedup !== null;
  } catch {
    // Fail closed: if Redis is unreachable we cannot enforce the dedup window,
    // so don't increment. Better to under-count than inflate when our defenses
    // are degraded.
    shouldIncrement = false;
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
