/**
 * SEO helpers — no hardcoded content. All inputs come from DB or env.
 * Strip HTML and normalise text for <meta>, og:*, twitter:*, and JSON-LD.
 */

export const SITE_NAME = "Cửu Long Mỹ Tửu";
export const SITE_BRAND = "Somo Gold";
export const SITE_LOCALE = "vi_VN";

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.VERCEL_URL ??
    "";

  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL is required in production. Set it to the canonical site URL (e.g. https://cuulongmytuu.vn)."
      );
    }
    return "http://localhost:3000";
  }
  const withScheme = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  return withScheme.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/**
 * Canonical path: strips query string and fragment so the same page served
 * under multiple URL variants maps to a single canonical.
 * Example: `/news/abc?utm=x#top` → `/news/abc`.
 */
export function canonicalPath(path: string): string {
  const [withoutFragment] = path.split("#");
  const [pathname] = withoutFragment.split("?");
  return pathname || "/";
}

/** Strip all HTML tags, collapse whitespace, trim. Safe for meta descriptions. */
export function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate to a character limit without cutting words; appends "…". */
export function truncate(input: string, max: number): string {
  if (input.length <= max) return input;
  const slice = input.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trimEnd()}…`;
}

export function metaDescription(raw: string | null | undefined, max = 160): string {
  return truncate(stripHtml(raw), max);
}

export function metaTitle(raw: string | null | undefined, max = 70): string {
  return truncate(stripHtml(raw), max);
}
