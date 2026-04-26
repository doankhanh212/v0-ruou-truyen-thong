import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  SECTION_KEYS,
  getSections,
  invalidateSectionsCache,
  isSectionKey,
  sanitizeSectionHtml,
  serializeSection,
  normalizeSectionImage,
  type SectionValue,
} from "@/lib/sections";
import { adminRateGuard } from "@/lib/admin-rate-limit";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const values = await getSections();
  return NextResponse.json({
    keys: SECTION_KEYS,
    values,
  });
}

/**
 * Body shape: { [key: SectionKey]: { text?: string; image?: string | null } }
 * Unknown keys → 400 immediately.
 * Text is sanitized. Image must be /uploads/ or http(s).
 */
export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updates: { key: string; serialized: string }[] = [];

  for (const [key, rawValue] of Object.entries(body as Record<string, unknown>)) {
    if (!isSectionKey(key)) {
      return NextResponse.json(
        { error: `Unknown section key: ${key}` },
        { status: 400 }
      );
    }
    if (!rawValue || typeof rawValue !== "object") {
      return NextResponse.json(
        { error: `Invalid value for ${key} (expected object)` },
        { status: 400 }
      );
    }

    const obj = rawValue as Record<string, unknown>;
    const text = typeof obj.text === "string" ? obj.text.slice(0, 10_000) : "";
    const cleanText = sanitizeSectionHtml(text);
    const image = normalizeSectionImage(obj.image);

    const value: SectionValue = { text: cleanText, image };
    updates.push({ key, serialized: serializeSection(value) });
  }

  if (!updates.length) {
    return NextResponse.json({ error: "No valid keys" }, { status: 400 });
  }

  await Promise.all(
    updates.map((u) =>
      db.section.upsert({
        where: { key: u.key },
        update: { body: u.serialized, isActive: true },
        create: { key: u.key, body: u.serialized, isActive: true },
      })
    )
  );

  await invalidateSectionsCache();
  const values = await getSections();
  return NextResponse.json({ keys: SECTION_KEYS, values });
}
