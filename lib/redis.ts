import Redis, { RedisOptions } from "ioredis";

const redisOptions: RedisOptions = {
  connectTimeout: 5000,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 5) {
      return null; // Dừng retry sau 5 lần thất bại
    }
    return Math.min(times * 100, 2000); // Exponential backoff
  },
};

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", redisOptions);

redis.on("error", (error) => {
  console.error(JSON.stringify({ module: "Redis", error: error.message }));
});

export default redis;