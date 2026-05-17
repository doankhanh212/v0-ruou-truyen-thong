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
  // Home — Trust ("Tại sao chọn chúng tôi")
  "home.trust.label",
  "home.trust.title",
  // Trust — Card 1 ("Catalog thật")
  "home.trust.card1_eyebrow",
  "home.trust.card1_title",
  "home.trust.card1_desc",
  "home.trust.card1_image",
  // Trust — Card 2 ("Biếu tặng cao cấp")
  "home.trust.card2_eyebrow",
  "home.trust.card2_title",
  "home.trust.card2_desc",
  "home.trust.card2_image",
  "home.trust.point1_title",
  "home.trust.point1_desc",
  "home.trust.point2_title",
  "home.trust.point2_desc",
  "home.trust.point3_title",
  "home.trust.point3_desc",
  "home.trust.point4_title",
  "home.trust.point4_desc",
  // Home — Products ("Dòng Sản Phẩm Cao Cấp")
  "home.products.label",
  "home.products.title",
  "home.products.subtitle",
  // Giới thiệu — Hero
  "gioi-thieu.hero.badge",
  "gioi-thieu.hero.subtitle",
  "gioi-thieu.hero.color",
  // Liên hệ — Hero
  "lien-he.hero.badge",
  "lien-he.hero.subtitle",
  "lien-he.hero.color",
  "lien-he.map.embed",
  "lien-he.contact.phone.label",
  "lien-he.contact.phone.value",
  "lien-he.contact.phone.sub",
  "lien-he.contact.phone.href",
  "lien-he.contact.phone.cta",
  "lien-he.contact.zalo.label",
  "lien-he.contact.zalo.value",
  "lien-he.contact.zalo.sub",
  "lien-he.contact.zalo.href",
  "lien-he.contact.zalo.cta",
  "lien-he.contact.email.label",
  "lien-he.contact.email.value",
  "lien-he.contact.email.sub",
  "lien-he.contact.email.href",
  "lien-he.contact.email.cta",
  // Tin tức — Hero
  // Chính sách — Hero
  "chinh-sach-doi-tra-hang.hero.badge",
  "chinh-sach-doi-tra-hang.hero.subtitle",
  "chinh-sach-doi-tra-hang.hero.color",
  "phuong-thuc-thanh-toan.hero.badge",
  "phuong-thuc-thanh-toan.hero.subtitle",
  "phuong-thuc-thanh-toan.hero.color",
  "chinh-sach-bao-mat.hero.badge",
  "chinh-sach-bao-mat.hero.subtitle",
  "chinh-sach-bao-mat.hero.color",
  "chinh-sach-giao-nhan-hang.hero.badge",
  "chinh-sach-giao-nhan-hang.hero.subtitle",
  "chinh-sach-giao-nhan-hang.hero.color",
  "tin-tuc.hero.badge",
  "tin-tuc.hero.title",
  "tin-tuc.hero.subtitle",
  "tin-tuc.hero.color",
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

const MAP_IFRAME_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["iframe"],
  allowedAttributes: {
    iframe: [
      "src",
      "title",
      "width",
      "height",
      "style",
      "class",
      "allowfullscreen",
      "loading",
      "referrerpolicy",
    ],
  },
  allowedSchemes: ["https"],
  allowedSchemesByTag: { iframe: ["https"] },
  transformTags: {
    iframe: (tagName, attribs) => {
      const src = attribs.src || "";
      let allowed = false;
      try {
        const url = new URL(src);
        const host = url.hostname.toLowerCase();
        allowed = host.includes("google.") && url.pathname.includes("/maps");
      } catch {
        allowed = false;
      }

      return {
        tagName,
        attribs: allowed
          ? {
              src,
              title: attribs.title || "Bản đồ Google Maps",
              width: attribs.width || "600",
              height: attribs.height || "450",
              style: "border:0;",
              allowfullscreen: "true",
              loading: attribs.loading || "lazy",
              referrerpolicy: attribs.referrerpolicy || "no-referrer-when-downgrade",
              ...(attribs.class ? { class: attribs.class } : {}),
            }
          : {},
      };
    },
  },
};

export function sanitizeMapEmbedHtml(html: string): string {
  if (!html) return "";
  const clean = sanitizeHtml(html, MAP_IFRAME_OPTIONS).trim();
  return clean.includes("<iframe") ? clean : "";
}

export function sanitizeSectionHtml(html: string, key?: string): string {
  if (!html) return "";
  if (key === "lien-he.map.embed") return sanitizeMapEmbedHtml(html);
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
