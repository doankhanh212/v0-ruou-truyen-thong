import { db } from "./db";

export const SETTING_KEYS = [
  "address",
  "email",
  "hotline",
  "phone",
  "zalo_url",
  "zalo_oaid",
  "website",
  "fanpage_url",
  "copyright",
  "home_page_size",
  "google_map_coords",
  "google_map_embed",
  "google_analytics",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export type SettingsMap = Record<SettingKey, string>;

export const DEFAULT_SETTINGS: SettingsMap = {
  address: "",
  email: "",
  hotline: "",
  phone: "",
  zalo_url: "",
  zalo_oaid: "",
  website: "",
  fanpage_url: "",
  copyright: "",
  home_page_size: "16",
  google_map_coords: "",
  google_map_embed: "",
  google_analytics: "",
};

let cache: { map: SettingsMap; expiresAt: number } | null = null;
// 10 s TTL — short enough that a PM2 cluster instance picks up admin writes
// within one request cycle without a full cache invalidation mechanism.
const TTL_MS = 10_000;

export async function getSettings(): Promise<SettingsMap> {
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
}
