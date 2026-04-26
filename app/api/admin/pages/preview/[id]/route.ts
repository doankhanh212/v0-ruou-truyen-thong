import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanitizePageHtml } from "@/lib/pages";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const pageId = Number(id);
  if (!Number.isFinite(pageId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const page = await db.page.findUnique({ where: { id: pageId } });
  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: page.id,
    slug: page.slug,
    title: page.title,
    content: sanitizePageHtml(page.content),
    isActive: page.isActive,
    isPublished: page.isPublished,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
  });
}
