import { db } from "./db";
import redis from "./redis";

export type SeoPageRecord = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  keywords: string | null;
  ogImage: string | null;
};

const TTL_SECONDS = 60;
const KEY_PREFIX = "cache:seo:";

function cacheKey(slug: string) {
  return `${KEY_PREFIX}${slug}`;
}

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
}

/**
 * Loads admin-defined SEO metadata for a page slug.
 * Slugs are stored without leading slash, e.g. "gioi-thieu", "lien-he".
 * Returns null when no override exists — caller falls back to defaults.
 */
export async function getSeoBySlug(slug: string): Promise<SeoPageRecord | null> {
  const key = normalizeSlug(slug);
  if (!key) return null;

  try {
    const cached = await redis.get(cacheKey(key));
    if (cached) {
      const parsed = JSON.parse(cached) as SeoPageRecord | { _null: true };
      return "_null" in parsed ? null : parsed;
    }
  } catch (err) {
    console.error(JSON.stringify({ module: "SeoPagesCache", op: "get", error: String(err) }));
  }

  let record: SeoPageRecord | null = null;
  try {
    const row = await db.seoPage.findUnique({ where: { slug: key } });
    if (row) {
      record = {
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        keywords: row.keywords,
        ogImage: row.ogImage,
      };
    }
  } catch (err) {
    console.error(JSON.stringify({ module: "SeoPages", op: "findUnique", error: String(err) }));
    return null;
  }

  try {
    await redis.setex(cacheKey(key), TTL_SECONDS, JSON.stringify(record ?? { _null: true }));
  } catch (err) {
    console.error(JSON.stringify({ module: "SeoPagesCache", op: "set", error: String(err) }));
  }

  return record;
}

export async function invalidateSeoCache(slug?: string) {
  try {
    if (!slug) {
      const keys = await redis.keys(`${KEY_PREFIX}*`);
      if (keys.length > 0) await redis.del(...keys);
      return;
    }
    await redis.del(cacheKey(normalizeSlug(slug)));
  } catch (err) {
    console.error(JSON.stringify({ module: "SeoPagesCache", op: "invalidate", error: String(err) }));
  }
}
