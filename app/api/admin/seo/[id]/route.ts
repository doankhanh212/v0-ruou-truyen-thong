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

const SeoPatch = z.object({
  slug: z.string().trim().min(1).max(120).optional(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(500).nullable().optional(),
  keywords: z.string().max(500).nullable().optional(),
  ogImage: z.string().max(500).nullable().optional(),
});

function normalizeSlug(raw: string): string {
  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .slice(0, 120);
  return normalized || "home";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const current = await db.seoPage.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Không tìm thấy SEO page" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = SeoPatch.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parsed.error.issues.map((i) => i.message) },
        { status: 400 }
      );
    }
    const data = parsed.data;

    let slug = current.slug;
    if (data.slug !== undefined) {
      const cleaned = normalizeSlug(data.slug);
      if (!cleaned) {
        return NextResponse.json({ error: "Slug không hợp lệ" }, { status: 400 });
      }
      if (cleaned !== current.slug) {
        const clash = await db.seoPage.findUnique({ where: { slug: cleaned } });
        if (clash && clash.id !== id) {
          return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 409 });
        }
      }
      slug = cleaned;
    }

    const updated = await db.seoPage.update({
      where: { id },
      data: {
        slug,
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.keywords !== undefined ? { keywords: data.keywords } : {}),
        ...(data.ogImage !== undefined ? { ogImage: data.ogImage } : {}),
      },
    });

    await invalidateSeoCache(current.slug);
    if (slug !== current.slug) await invalidateSeoCache(slug);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin/seo PATCH]", error);
    return NextResponse.json({ error: "Không thể cập nhật SEO page" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  const { id } = await params;
  try {
    const current = await db.seoPage.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Không tìm thấy SEO page" }, { status: 404 });
    }

    await db.seoPage.delete({ where: { id } });
    await invalidateSeoCache(current.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/seo DELETE]", error);
    return NextResponse.json({ error: "Không thể xoá SEO page" }, { status: 500 });
  }
}
