import { db } from "./db";
import redis from "./redis";

export const BANNER_POSITIONS = ["home_hero"] as const;
export type BannerPosition = (typeof BANNER_POSITIONS)[number];

export function isBannerPosition(value: string): value is BannerPosition {
  return (BANNER_POSITIONS as readonly string[]).includes(value);
}

export type BannerRecord = {
  id: number;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  position: string;
  sortOrder: number;
  isActive: boolean;
};

const TTL_SECONDS = 60;
const KEY_PREFIX = "cache:banners:";

function cacheKey(position: BannerPosition) {
  return `${KEY_PREFIX}${position}`;
}

export async function getActiveBanners(position: BannerPosition): Promise<BannerRecord[]> {
  const key = cacheKey(position);
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as BannerRecord[];
  } catch (err) {
    console.error(JSON.stringify({ module: "BannersCache", op: "get", error: String(err) }));
  }

  let list: BannerRecord[] = [];
  try {
    list = await db.banner.findMany({
      where: { position, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch (err) {
    console.error(JSON.stringify({ module: "Banners", op: "findMany", error: String(err) }));
    return [];
  }

  try {
    await redis.setex(key, TTL_SECONDS, JSON.stringify(list));
  } catch (err) {
    console.error(JSON.stringify({ module: "BannersCache", op: "set", error: String(err) }));
  }

  return list;
}

export async function getPrimaryBanner(position: BannerPosition): Promise<BannerRecord | null> {
  const list = await getActiveBanners(position);
  return list[0] ?? null;
}

export async function invalidateBannerCache(position?: BannerPosition) {
  try {
    if (!position) {
      const keys = await redis.keys(`${KEY_PREFIX}*`);
      if (keys.length > 0) await redis.del(...keys);
      return;
    }
    await redis.del(cacheKey(position));
  } catch (err) {
    console.error(JSON.stringify({ module: "BannersCache", op: "invalidate", error: String(err) }));
  }
}
