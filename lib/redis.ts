import Redis, { RedisOptions } from "ioredis";

/**
 * Fail-fast Redis client.
 * - `enableOfflineQueue: false` — when the socket is down, commands reject
 *   immediately instead of queuing. Caller code already handles errors and
 *   falls back to direct DB reads, so we must not block the request.
 * - `lazyConnect: true` — don't open a TCP socket at module-load time.
 *   First use opens it; if it fails, subsequent calls fail in <5ms.
 * - retry strategy returns null after a couple of attempts so we don't loop.
 */
const redisOptions: RedisOptions = {
  connectTimeout: 2000,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 200, 1000);
  },
  reconnectOnError: () => false,
};

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", redisOptions);

redis.on("error", (error) => {
  // Avoid spamming JSON for the empty-message reconnect events ioredis emits.
  if (!error.message) return;
  if (process.env.NODE_ENV !== "production") {
    // Dev: one short line is enough.
    console.warn(`[redis] ${error.message}`);
    return;
  }
  console.error(JSON.stringify({ module: "Redis", error: error.message }));
});

export default redis;
