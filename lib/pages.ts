import sanitizeHtml from "sanitize-html";
import { db } from "./db";
import redis from "./redis";

export type PageRecord = {
  id: number;
  slug: string;
  title: string;
  content: string;
  isActive: boolean;
  isPublished: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
};

const TTL_SECONDS = 60;
const KEY_PREFIX = "cache:pages:";

function cacheKey(slug: string) {
  return `${KEY_PREFIX}${slug}`;
}

export async function getPageBySlug(slug: string): Promise<PageRecord | null> {
  const key = slug.trim().toLowerCase();
  if (!key) return null;

  try {
    const cached = await redis.get(cacheKey(key));
    if (cached) {
      const parsed = JSON.parse(cached) as PageRecord | { _null: true };
      return "_null" in parsed ? null : parsed;
    }
  } catch (err) {
    console.error(JSON.stringify({ module: "PagesCache", op: "get", error: String(err) }));
  }

  let page: PageRecord | null = null;
  try {
    const row = await db.page.findUnique({ where: { slug: key } });
    if (row && row.isActive && row.isPublished) {
      page = {
        id: row.id,
        slug: row.slug,
        title: row.title,
        content: row.content,
        isActive: row.isActive,
        isPublished: row.isPublished,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
      };
    }
  } catch (err) {
    console.error(JSON.stringify({ module: "Pages", op: "findUnique", error: String(err) }));
    return null;
  }

  try {
    // Cache the negative answer too so missing-page lookups don't hammer the DB.
    await redis.setex(cacheKey(key), TTL_SECONDS, JSON.stringify(page ?? { _null: true }));
  } catch (err) {
    console.error(JSON.stringify({ module: "PagesCache", op: "set", error: String(err) }));
  }

  return page;
}

export async function invalidatePageCache(slug?: string) {
  try {
    if (!slug) {
      const keys = await redis.keys(`${KEY_PREFIX}*`);
      if (keys.length > 0) await redis.del(...keys);
      return;
    }
    await redis.del(cacheKey(slug.trim().toLowerCase()));
  } catch (err) {
    console.error(JSON.stringify({ module: "PagesCache", op: "invalidate", error: String(err) }));
  }
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4",
    "p", "br", "hr",
    "ul", "ol", "li",
    "strong", "em", "b", "i",
    "a", "img",
    "blockquote",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  disallowedTagsMode: "discard",
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        href: attribs.href || "",
        rel: "noopener noreferrer",
        target: "_blank",
      },
    }),
  },
};

export function sanitizePageHtml(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}
