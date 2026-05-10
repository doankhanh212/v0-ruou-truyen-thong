import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminRateGuard } from "@/lib/admin-rate-limit";
import { invalidateSeoCache } from "@/lib/seo-pages";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const SeoInput = z.object({
  slug: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(500).nullable().optional(),
  keywords: z.string().max(500).nullable().optional(),
  ogImage: z.string().max(500).nullable().optional(),
});

function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .slice(0, 120);
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const pages = await db.seoPage.findMany({
      orderBy: [{ slug: "asc" }],
    });
    return NextResponse.json({ pages });
  } catch (error) {
    console.error("[admin/seo GET]", error);
    return NextResponse.json({ error: "Không thể tải danh sách SEO" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = SeoInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parsed.error.issues.map((i) => i.message) },
        { status: 400 }
      );
    }

    const slug = normalizeSlug(parsed.data.slug);
    if (!slug) {
      return NextResponse.json({ error: "Slug không hợp lệ" }, { status: 400 });
    }

    const existing = await db.seoPage.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug này đã tồn tại" }, { status: 409 });
    }

    const page = await db.seoPage.create({
      data: {
        slug,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        keywords: parsed.data.keywords ?? null,
        ogImage: parsed.data.ogImage ?? null,
      },
    });

    await invalidateSeoCache(slug);
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("[admin/seo POST]", error);
    return NextResponse.json({ error: "Không thể tạo SEO page" }, { status: 500 });
  }
}
