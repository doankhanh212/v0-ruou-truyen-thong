import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { invalidatePageCache } from "@/lib/pages";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function normalizeSlug(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .slice(0, 120);
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const pages = await db.page.findMany({
    orderBy: [{ updatedAt: "desc" }],
  });
  return NextResponse.json({ pages });
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const body = await request.json().catch(() => ({}));
  const slug = normalizeSlug((body as Record<string, unknown>).slug);
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";
  const content = typeof body.content === "string" ? body.content.slice(0, 100_000) : "";
  const isActive = typeof body.isActive === "boolean" ? body.isActive : true;
  const isPublished = typeof body.isPublished === "boolean" ? body.isPublished : true;
  const metaTitle = typeof body.metaTitle === "string" ? body.metaTitle.trim().slice(0, 200) || null : null;
  const metaDescription = typeof body.metaDescription === "string" ? body.metaDescription.trim().slice(0, 500) || null : null;

  if (!slug || !title) {
    return NextResponse.json({ error: "slug and title required" }, { status: 400 });
  }

  const existing = await db.page.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const page = await db.page.create({
    data: { slug, title, content, isActive, isPublished, metaTitle, metaDescription },
  });

  await invalidatePageCache(slug);
  return NextResponse.json(page, { status: 201 });
}
