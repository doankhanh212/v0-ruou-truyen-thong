import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getSettings,
  invalidateSettingsCache,
  SETTING_KEYS,
  type SettingKey,
} from "@/lib/settings";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const map = await getSettings();
  return NextResponse.json(map);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updates: { key: SettingKey; value: string }[] = [];
  for (const key of SETTING_KEYS) {
    const raw = (body as Record<string, unknown>)[key];
    if (typeof raw === "string") {
      updates.push({ key, value: raw.trim().slice(0, 4000) });
    }
  }

  await Promise.all(
    updates.map((u) =>
      db.setting.upsert({
        where: { key: u.key },
        update: { value: u.value },
        create: { key: u.key, value: u.value },
      })
    )
  );

  invalidateSettingsCache();
  const map = await getSettings();
  return NextResponse.json(map);
}
