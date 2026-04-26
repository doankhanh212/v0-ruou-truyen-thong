import { NextRequest, NextResponse } from "next/server";
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  const { id } = await params;
  const postId = parseInt(id);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    const allowed = ["title", "image", "isPublished", "isDeleted", "metaTitle", "metaDescription"];

    for (const field of allowed) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    if (body.content !== undefined) {
      if (typeof body.content !== "string") {
        return NextResponse.json({ error: "Nội dung không hợp lệ" }, { status: 400 });
      }
      data.content = sanitizeHtml(body.content, POST_HTML_OPTIONS);
    }

    if (body.slug !== undefined) {
      const cleanSlug = slugify(String(body.slug));
      if (!cleanSlug) {
        return NextResponse.json({ error: "Slug không hợp lệ" }, { status: 400 });
      }
      if (cleanSlug !== post.slug) {
        const existing = await db.post.findUnique({ where: { slug: cleanSlug } });
        if (existing) {
          return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 409 });
        }
      }
      data.slug = cleanSlug;
    }

    const updated = await db.post.update({
      where: { id: postId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin/posts PATCH]", error);
    return NextResponse.json({ error: "Không thể cập nhật" }, { status: 500 });
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
  const postId = parseInt(id);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Không tìm thấy bài viết" }, { status: 404 });
    }

    const deleted = await db.post.update({
      where: { id: postId },
      data: { isDeleted: true },
    });
    return NextResponse.json({ ok: true, post: deleted });
  } catch (error) {
    console.error("[admin/posts DELETE]", error);
    return NextResponse.json({ error: "Không thể xóa" }, { status: 500 });
  }
}
