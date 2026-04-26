import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminRateGuard } from "@/lib/admin-rate-limit";

const MEDIA_TYPES = ["logo", "banner", "slideshow", "popup", "fanpage_image", "section", "product"] as const;
type MediaType = (typeof MEDIA_TYPES)[number];

const MAX_BYTES = 3 * 1024 * 1024;
// SVG/GIF removed — SVG can carry inline scripts (XSS) when served from same origin.
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const where = type && (MEDIA_TYPES as readonly string[]).includes(type) ? { type } : {};
  const items = await db.media.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const file = form.get("file");
  const rawType = String(form.get("type") ?? "").trim();
  const title = String(form.get("title") ?? "").trim() || null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (!(MEDIA_TYPES as readonly string[]).includes(rawType)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 3MB)" }, { status: 413 });
  }

  const ext = EXT_BY_MIME[file.type] ?? path.extname(file.name).toLowerCase();
  const filename = `${rawType}-${randomUUID()}${ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const dest = path.join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buffer);

  const publicUrl = `/uploads/${filename}`;
  const created = await db.media.create({
    data: {
      type: rawType as MediaType,
      url: publicUrl,
      title,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
