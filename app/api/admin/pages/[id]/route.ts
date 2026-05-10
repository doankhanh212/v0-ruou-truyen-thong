import { NextRequest, NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminRateGuard } from "@/lib/admin-rate-limit";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const PAGE_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4",
    "p", "br", "hr", "blockquote",
    "ul", "ol", "li",
    "strong", "em", "b", "i", "u", "s",
    "a", "img",
    "code", "pre",
    "span", "div",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "class"],
    img: ["src", "alt", "width", "height", "class"],
    p: ["style"],
    h1: ["style"], h2: ["style"], h3: ["style"], h4: ["style"],
    span: ["style"],
    div: ["style", "class"],
    td: ["style"], th: ["style"],
  },
  allowedStyles: {
    "*": {
      "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        href: attribs.href || "",
        rel: "noopener noreferrer",
        target: "_blank",
        class: attribs.class || "",
      },
    }),
  },
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const pageId = parseInt(id);
  if (isNaN(pageId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const page = await db.page.findUnique({ where: { id: pageId } });
    if (!page) return NextResponse.json({ error: "Không tìm thấy trang" }, { status: 404 });
    return NextResponse.json(page);
  } catch (error) {
    console.error("[admin/pages GET id]", error);
    return NextResponse.json({ error: "Không thể tải trang" }, { status: 500 });
  }
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
  const pageId = parseInt(id);
  if (isNaN(pageId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const page = await db.page.findUnique({ where: { id: pageId } });
    if (!page) {
      return NextResponse.json({ error: "Không tìm thấy trang" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    const allowed = ["title", "isPublished", "isActive", "metaTitle", "metaDescription"];
    for (const field of allowed) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    if (body.content !== undefined) {
      if (typeof body.content !== "string") {
        return NextResponse.json({ error: "Nội dung không hợp lệ" }, { status: 400 });
      }
      data.content = sanitizeHtml(body.content, PAGE_HTML_OPTIONS);
    }

    const updated = await db.page.update({ where: { id: pageId }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin/pages PATCH]", error);
    return NextResponse.json({ error: "Không thể cập nhật" }, { status: 500 });
  }
}
