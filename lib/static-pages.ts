import { db } from "./db";

export type StaticPageRecord = {
  id: number;
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
};

/**
 * Loads admin-managed static page content by slug.
 * Returns null when no record exists or the page is unpublished.
 */
export async function getStaticPage(slug: string): Promise<StaticPageRecord | null> {
  try {
    const page = await db.page.findFirst({
      where: { slug, isActive: true },
    });
    if (!page) return null;
    return {
      id: page.id,
      slug: page.slug,
      title: page.title,
      content: page.content,
      isPublished: page.isPublished,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
    };
  } catch (err) {
    console.error(JSON.stringify({ module: "StaticPages", op: "getStaticPage", error: String(err) }));
    return null;
  }
}
