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

function normalizeSlug(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  return raw.trim().toLowerCase().replace(/^\/+|\/+$/g, "").slice(0, 120);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const pageId = Number(id);
  if (!Number.isFinite(pageId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const page = await db.page.findUnique({ where: { id: pageId } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const pageId = Number(id);
  if (!Number.isFinite(pageId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const current = await db.page.findUnique({ where: { id: pageId } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const data: {
    slug?: string;
    title?: string;
    content?: string;
    isActive?: boolean;
    isPublished?: boolean;
    metaTitle?: string | null;
    metaDescription?: string | null;
  } = {};

  const slugCandidate = normalizeSlug((body as Record<string, unknown>).slug);
  if (slugCandidate !== undefined && slugCandidate && slugCandidate !== current.slug) {
    const clash = await db.page.findUnique({ where: { slug: slugCandidate } });
    if (clash && clash.id !== pageId) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    data.slug = slugCandidate;
  }

  if (typeof body.title === "string") data.title = body.title.trim().slice(0, 200);
  if (typeof body.content === "string") data.content = body.content.slice(0, 100_000);
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.isPublished === "boolean") data.isPublished = body.isPublished;
  if (typeof body.metaTitle === "string") data.metaTitle = body.metaTitle.trim().slice(0, 200) || null;
  if (typeof body.metaDescription === "string") data.metaDescription = body.metaDescription.trim().slice(0, 500) || null;

  const updated = await db.page.update({ where: { id: pageId }, data });

  await invalidatePageCache(current.slug);
  if (data.slug) await invalidatePageCache(data.slug);

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const pageId = Number(id);
  if (!Number.isFinite(pageId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const current = await db.page.findUnique({ where: { id: pageId } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.page.delete({ where: { id: pageId } });
  await invalidatePageCache(current.slug);
  return NextResponse.json({ ok: true });
}
