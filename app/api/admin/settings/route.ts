import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { adminRateGuard } from "@/lib/admin-rate-limit";
import { db } from "@/lib/db";
import {
  getSettings,
  invalidateSettingsCache,
  SETTING_KEYS,
  type SettingKey,
} from "@/lib/settings";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const settings = await getSettings();
  return NextResponse.json(settings);
}

async function saveSettings(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updates: { key: SettingKey; value: string }[] = [];
  const input = body as Record<string, unknown>;
  for (const key of SETTING_KEYS) {
    const raw = input[key];
    if (typeof raw === "string") {
      updates.push({ key, value: raw.slice(0, 200_000) });
    }
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No valid setting keys" }, { status: 400 });
  }

  await Promise.all(
    updates.map((item) =>
      db.setting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      })
    )
  );

  invalidateSettingsCache();
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  return saveSettings(request);
}

export async function PUT(request: NextRequest) {
  return saveSettings(request);
}
