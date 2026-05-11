import { NextRequest, NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminRateGuard } from "@/lib/admin-rate-limit";
import { PAGE_HTML_OPTIONS } from "@/lib/sanitize-page-html";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const pageId = Number.parseInt(id, 10);
  if (!Number.isInteger(pageId) || pageId <= 0) {
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
  const pageId = Number.parseInt(id, 10);
  if (!Number.isInteger(pageId) || pageId <= 0) {
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
