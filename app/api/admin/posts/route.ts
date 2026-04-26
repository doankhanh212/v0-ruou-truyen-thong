import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { adminRateGuard } from "@/lib/admin-rate-limit";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const POST_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["h1", "h2", "h3", "h4", "p", "br", "hr", "ul", "ol", "li", "strong", "em", "b", "i", "a", "img", "blockquote"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
  },
};

const PostInput = z.object({
  title: z.string().trim().min(1).max(300),
  slug: z.string().trim().max(300).optional(),
  content: z.string().min(1).max(100_000),
  image: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const includeDeleted = request.nextUrl.searchParams.get("includeDeleted") === "true";

  try {
    const posts = await db.post.findMany({
      where: includeDeleted ? {} : { isDeleted: false },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[admin/posts GET]", error);
    return NextResponse.json({ error: "Không thể tải bài viết" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = PostInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parsed.error.issues.map((i) => i.message) },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const cleanSlug = slugify(data.slug || "") || slugify(data.title);
    if (!cleanSlug) {
      return NextResponse.json({ error: "Slug không hợp lệ" }, { status: 400 });
    }

    const existing = await db.post.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 409 });
    }

    const post = await db.post.create({
      data: {
        title: data.title,
        slug: cleanSlug,
        content: sanitizeHtml(data.content, POST_HTML_OPTIONS),
        image: data.image || null,
        isPublished: data.isPublished ?? true,
        isDeleted: false,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("[admin/posts POST]", error);
    return NextResponse.json({ error: "Không thể tạo bài viết" }, { status: 500 });
  }
}
