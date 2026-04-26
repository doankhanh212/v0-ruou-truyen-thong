import { NextResponse } from "next/server";
import { getPageBySlug, sanitizePageHtml } from "@/lib/pages";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: page.id,
    slug: page.slug,
    title: page.title,
    content: sanitizePageHtml(page.content),
    isActive: page.isActive,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
  });
}
