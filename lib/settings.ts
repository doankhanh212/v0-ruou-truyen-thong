import { db } from "./db";
import redis from "./redis";

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
  "gtm_id",
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
  gtm_id: "",
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
