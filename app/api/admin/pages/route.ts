import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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

const PageInput = z.object({
  slug: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(300),
  content: z.string().min(0).max(200_000),
  isPublished: z.boolean().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
});

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const pages = await db.page.findMany({
      orderBy: { slug: "asc" },
    });
    return NextResponse.json({ pages });
  } catch (error) {
    console.error("[admin/pages GET]", error);
    return NextResponse.json({ error: "Không thể tải trang" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = PageInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parsed.error.issues.map((i) => i.message) },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const existing = await db.page.findUnique({ where: { slug: data.slug } });

    const pageData = {
      title: data.title,
      content: sanitizeHtml(data.content, PAGE_HTML_OPTIONS),
      isPublished: data.isPublished ?? true,
      isActive: true,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
    };

    if (existing) {
      const updated = await db.page.update({ where: { slug: data.slug }, data: pageData });
      return NextResponse.json(updated);
    }

    const page = await db.page.create({ data: { slug: data.slug, ...pageData } });
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("[admin/pages POST]", error);
    return NextResponse.json({ error: "Không thể lưu trang" }, { status: 500 });
  }
}
