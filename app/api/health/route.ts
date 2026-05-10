import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import redis from "@/lib/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Liveness + readiness probe.
 *
 * - DB is REQUIRED → 503 if unreachable (PM2/Nginx will mark instance unhealthy).
 * - Redis is OPTIONAL → degraded but the app still serves (cache fallthrough,
 *   rate limit fail-open). Status is reported but doesn't fail the probe.
 */
export async function GET() {
  const started = Date.now();
  const checks: { db: boolean; redis: boolean; dbLatencyMs?: number; redisLatencyMs?: number } = {
    db: false,
    redis: false,
  };

  const dbStart = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    checks.db = true;
    checks.dbLatencyMs = Date.now() - dbStart;
  } catch (err) {
    console.error("[health] db check failed:", err);
  }

  const redisStart = Date.now();
  try {
    const pong = await redis.ping();
    checks.redis = pong === "PONG";
    checks.redisLatencyMs = Date.now() - redisStart;
  } catch {
    // Redis offline is acceptable; app degrades gracefully.
  }

  const ok = checks.db;
  return NextResponse.json(
    {
      ok,
      checks,
      uptimeSec: Math.round(process.uptime()),
      totalLatencyMs: Date.now() - started,
      version: process.env.npm_package_version ?? null,
    },
    {
      status: ok ? 200 : 503,
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}
