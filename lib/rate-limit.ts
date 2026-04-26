import redis from "./redis";

export async function rateLimit(
  identifier: string,
  limit: number,
  windowInSeconds: number
): Promise<{ success: boolean; limit: number; remaining: number }> {
  try {
    const key = `ratelimit:${identifier}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, windowInSeconds);
    }

    return {
      success: current <= limit,
      limit,
      remaining: Math.max(0, limit - current),
    };
  } catch (error) {
    console.error(JSON.stringify({ module: "RateLimit", error: String(error) }));
    return { success: true, limit, remaining: limit }; // Fail open nếu Redis chết
  }
}