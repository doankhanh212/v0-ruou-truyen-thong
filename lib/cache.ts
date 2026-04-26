import redis from "./redis";

export async function getCachedData<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number = 3600): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    console.error(JSON.stringify({ module: "Cache", error: String(err) }));
  }

  const data = await fetcher();

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (err) {
    console.error(JSON.stringify({ module: "CacheSet", error: String(err) }));
  }

  return data;
}