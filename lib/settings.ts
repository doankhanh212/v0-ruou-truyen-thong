import { db } from "./db";
import redis from "./redis";

export const SETTING_KEYS = [
  // Contact
  "address",
  "email",
  "hotline",
  "phone",
  // Social
  "zalo_url",
  "zalo_oaid",
  "website",
  "fanpage_url",
  // Display
  "home_page_size",
  // Analytics
  "google_map_coords",
  "google_map_embed",
  "google_analytics",
  "gtm_id",
  // Header
  "header_site_name",
  "header_nav_links",
  "header_zalo_label",
  // Footer
  "footer_brand_name",
  "footer_brand_desc",
  "footer_copyright",
  "footer_phone",
  "footer_email",
  "footer_address",
  "footer_show_fanpage",
  "footer_config",
  "system_config",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export type SettingsMap = Record<SettingKey, string>;

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterConfig = {
  shopInfoHtml: string;
  newsLinks: FooterLink[];
  policyLinks: FooterLink[];
  fanpageIframe: string;
  copyright: string;
};

export type SystemConfig = {
  gtmId: string;
  facebookPixelId: string;
  defaultOgImage: string;
  orderNotifyEmail: string;
  freeShippingThreshold: number;
  agePopupEnabled: boolean;
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  shopInfoHtml:
    "<p><strong>Rượu Truyền Thống</strong></p><p>Rượu truyền thống cao cấp, chưng cất từ dược liệu Việt Nam theo phương pháp truyền thống.</p>",
  newsLinks: [
    { label: "Tin tức", href: "/news" },
    { label: "Sản phẩm", href: "/san-pham" },
    { label: "Giới thiệu", href: "/gioi-thieu" },
    { label: "Liên hệ", href: "/lien-he" },
  ],
  policyLinks: [
    { label: "Chính sách bảo mật", href: "/lien-he" },
    { label: "Điều khoản dịch vụ", href: "/lien-he" },
    { label: "Chính sách hoàn trả", href: "/lien-he" },
  ],
  fanpageIframe: "",
  copyright: "Rượu Truyền Thống. Tất cả các quyền được bảo lưu.",
};

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  gtmId: "",
  facebookPixelId: "",
  defaultOgImage: "",
  orderNotifyEmail: "",
  freeShippingThreshold: 0,
  agePopupEnabled: true,
};

export const DEFAULT_SETTINGS: SettingsMap = {
  address: "",
  email: "",
  hotline: "",
  phone: "",
  zalo_url: "",
  zalo_oaid: "",
  website: "",
  fanpage_url: "",
  home_page_size: "16",
  google_map_coords: "",
  google_map_embed: "",
  google_analytics: "",
  gtm_id: "",
  // Header defaults
  header_site_name: "Rượu Truyền Thống",
  header_nav_links: JSON.stringify([
    { label: "Trang chủ", href: "/" },
    { label: "Sản phẩm", href: "/san-pham" },
    { label: "Tin tức", href: "/news" },
    { label: "Giới thiệu", href: "/gioi-thieu" },
    { label: "Liên hệ", href: "/lien-he" },
  ]),
  header_zalo_label: "Chat Zalo",
  // Footer defaults
  footer_brand_name: "Rượu Truyền Thống",
  footer_brand_desc: "Rượu truyền thống cao cấp — chưng cất từ dược liệu Việt Nam theo phương pháp truyền thống. Đạt ISO 22000:2018 & OCOP 4 sao.",
  footer_copyright: "Rượu Truyền Thống. Tất cả các quyền được bảo lưu.",
  footer_phone: "0909 799 311 – 0902 931 119",
  footer_email: "somogold@somogroup.vn",
  footer_address: "29 Nguyễn Khắc Nhu, P. Cầu Ông Lãnh, TP. HCM",
  footer_show_fanpage: "1",
  footer_config: "",
  system_config: "",
};

let cache: { map: SettingsMap; expiresAt: number } | null = null;
// 10 s TTL — combined with the Redis pub/sub invalidation below, this gives
// us "instant" propagation across the PM2 cluster and bounded staleness if
// Redis is unreachable.
const TTL_MS = 10_000;
const INVALIDATION_CHANNEL = "settings:invalidate";

let subscribed = false;
function ensureSubscribed() {
  if (subscribed) return;
  subscribed = true;
  // Use a dedicated subscriber connection — ioredis disallows mixing
  // subscribe/publish on the same client.
  try {
    const sub = redis.duplicate();
    sub.on("error", () => {});
    sub.subscribe(INVALIDATION_CHANNEL).catch(() => {});
    sub.on("message", (channel) => {
      if (channel === INVALIDATION_CHANNEL) cache = null;
    });
  } catch {
    // If duplicate() fails (Redis down), fall back to TTL-only behaviour.
  }
}

export async function getSettings(): Promise<SettingsMap> {
  ensureSubscribed();
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.map;

  const map: SettingsMap = { ...DEFAULT_SETTINGS };
  try {
    const rows = await db.setting.findMany();
    for (const r of rows) {
      if ((SETTING_KEYS as readonly string[]).includes(r.key)) {
        map[r.key as SettingKey] = r.value;
      }
    }
  } catch {
    // DB unavailable — fall through with defaults
  }

  cache = { map, expiresAt: now + TTL_MS };
  return map;
}

export function invalidateSettingsCache() {
  cache = null;
  // Tell every other worker to drop its in-memory cache too. Fire-and-forget:
  // if Redis is down each worker still expires within TTL_MS.
  void redis.publish(INVALIDATION_CHANNEL, "1").catch(() => {});
}

function parseObject(raw: string | null | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeLinks(value: unknown, fallback: FooterLink[]): FooterLink[] {
  if (!Array.isArray(value)) return fallback;
  const links = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const label = typeof row.label === "string" ? row.label.trim().slice(0, 120) : "";
      const href = typeof row.href === "string" ? row.href.trim().slice(0, 500) : "";
      return label && href ? { label, href } : null;
    })
    .filter((item): item is FooterLink => Boolean(item));
  return links.length > 0 ? links : fallback;
}

export function getFooterConfig(settings: SettingsMap): FooterConfig {
  const parsed = parseObject(settings.footer_config);
  const legacyShopInfo = [
    settings.footer_brand_name ? `<p><strong>${settings.footer_brand_name}</strong></p>` : "",
    settings.footer_brand_desc ? `<p>${settings.footer_brand_desc}</p>` : "",
    settings.footer_phone ? `<p>Hotline: ${settings.footer_phone}</p>` : "",
    settings.footer_email ? `<p>Email: ${settings.footer_email}</p>` : "",
    settings.footer_address ? `<p>Địa chỉ: ${settings.footer_address}</p>` : "",
  ].join("");

  return {
    shopInfoHtml: stringValue(
      parsed.shopInfoHtml,
      legacyShopInfo || DEFAULT_FOOTER_CONFIG.shopInfoHtml
    ),
    newsLinks: normalizeLinks(parsed.newsLinks, DEFAULT_FOOTER_CONFIG.newsLinks),
    policyLinks: normalizeLinks(parsed.policyLinks, DEFAULT_FOOTER_CONFIG.policyLinks),
    fanpageIframe: stringValue(parsed.fanpageIframe),
    copyright: stringValue(
      parsed.copyright,
      settings.footer_copyright || DEFAULT_FOOTER_CONFIG.copyright
    ),
  };
}

export function getSystemConfig(settings: SettingsMap): SystemConfig {
  const parsed = parseObject(settings.system_config);
  const threshold =
    typeof parsed.freeShippingThreshold === "number"
      ? parsed.freeShippingThreshold
      : Number(parsed.freeShippingThreshold ?? 0);

  return {
    gtmId: stringValue(parsed.gtmId, settings.gtm_id).trim(),
    facebookPixelId: stringValue(parsed.facebookPixelId).trim(),
    defaultOgImage: stringValue(parsed.defaultOgImage).trim(),
    orderNotifyEmail: stringValue(parsed.orderNotifyEmail, settings.email).trim(),
    freeShippingThreshold:
      Number.isFinite(threshold) && threshold > 0 ? Math.round(threshold) : 0,
    agePopupEnabled:
      typeof parsed.agePopupEnabled === "boolean"
        ? parsed.agePopupEnabled
        : DEFAULT_SYSTEM_CONFIG.agePopupEnabled,
  };
}
