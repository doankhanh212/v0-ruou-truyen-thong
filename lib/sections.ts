import sanitizeHtml from "sanitize-html";
import { db } from "./db";
import redis from "./redis";

/**
 * Page-scoped section keys: <page>.<section>.<field>
 * Every visible Section on the site must be registered here.
 * Admin API rejects any key not in this list with HTTP 400.
 */
export const SECTION_KEYS = [
  // Home — Hero
  "home.hero.badge",
  "home.hero.title",
  "home.hero.title_accent",
  "home.hero.subtitle",
  "home.hero.cta_primary_label",
  "home.hero.cta_secondary_label",
  "home.hero.stat_number",
  "home.hero.stat_label",
  // Home — CTA
  "home.cta.title",
  "home.cta.body",
  "home.cta.primary_label",
  "home.cta.secondary_label",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

/**
 * Stored shape: a Section row's `body` column is a JSON string of SectionValue.
 * `text` is sanitized HTML; `image` is a /uploads/... URL (or absolute).
 */
export type SectionValue = {
  text: string;
  image: string | null;
};

export type SectionsMap = Record<SectionKey, SectionValue>;

export function isSectionKey(key: string): key is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(key);
}

const EMPTY: SectionValue = { text: "", image: null };

/**
 * Strict JSON parser for Section.body.
 * Never throws. Returns an empty SectionValue if payload is invalid — the
 * caller (admin UI / component) is responsible for rendering an empty state
 * in that case. NO default content is injected.
 */
export function parseSection(raw: string | null | undefined): SectionValue {
  if (!raw) return { text: "", image: null };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      const text = typeof parsed.text === "string" ? parsed.text : "";
      const image =
        typeof parsed.image === "string" && parsed.image.trim().length > 0
          ? parsed.image
          : null;
      return { text, image };
    }
  } catch {
    // Legacy rows may contain plain text — read it as `text`.
    return { text: raw, image: null };
  }
  return { text: "", image: null };
}

export function serializeSection(value: SectionValue): string {
  return JSON.stringify({
    text: value.text ?? "",
    image: value.image ?? null,
  });
}

const SECTIONS_CACHE_KEY = "cache:sections:all";
const TTL_SECONDS = 60;

/**
 * Returns every whitelisted section key mapped to its current value.
 * Keys that don't exist in DB yield an empty SectionValue — components
 * must check `text`/`image` and render an empty state when both are empty.
 * There is NO fallback to hardcoded defaults.
 */
export async function getSections(): Promise<SectionsMap> {
  try {
    const cached = await redis.get(SECTIONS_CACHE_KEY);
    if (cached) return JSON.parse(cached) as SectionsMap;
  } catch (err) {
    console.error(JSON.stringify({ module: "SectionsCache", op: "get", error: String(err) }));
  }

  const map: SectionsMap = {} as SectionsMap;
  for (const k of SECTION_KEYS) map[k] = { ...EMPTY };

  try {
    const rows = await db.section.findMany({ where: { isActive: true } });
    for (const r of rows) {
      if (isSectionKey(r.key)) {
        map[r.key] = parseSection(r.body);
      }
    }
  } catch (err) {
    console.error(JSON.stringify({ module: "Sections", op: "findMany", error: String(err) }));
    // DB unavailable: leave map as all-empty. UI shows empty states.
    return map;
  }

  try {
    await redis.setex(SECTIONS_CACHE_KEY, TTL_SECONDS, JSON.stringify(map));
  } catch (err) {
    console.error(JSON.stringify({ module: "SectionsCache", op: "set", error: String(err) }));
  }

  return map;
}

export async function invalidateSectionsCache() {
  try {
    await redis.del(SECTIONS_CACHE_KEY);
  } catch (err) {
    console.error(JSON.stringify({ module: "SectionsCache", op: "invalidate", error: String(err) }));
  }
}

/**
 * Tag/attribute whitelist for Section.text. Runs on every admin write so
 * values pulled from DB are already safe to render via dangerouslySetInnerHTML.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "span", "strong", "em", "b", "i", "u",
    "a", "ul", "ol", "li",
    "h1", "h2", "h3", "h4",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    span: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
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

export function sanitizeSectionHtml(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

/**
 * Validate image URL — must be a /uploads/... path or an https URL.
 * Returns the cleaned URL or null.
 */
export function normalizeSectionImage(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  if (!v) return null;
  if (v.startsWith("/uploads/") || v.startsWith("https://") || v.startsWith("http://")) {
    return v.slice(0, 500);
  }
  return null;
}
