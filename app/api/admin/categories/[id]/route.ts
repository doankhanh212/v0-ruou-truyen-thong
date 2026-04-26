import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const categoryId = parseInt(id);
  if (isNaN(categoryId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();
  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    const duplicateName = await db.category.findFirst({
      where: {
        id: { not: categoryId },
        isDeleted: false,
        name: { equals: name, mode: "insensitive" },
      },
    });
    if (duplicateName) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 409 });
    }
    data.name = name;
  }
  if (body.slug !== undefined) {
    const slug = String(body.slug).trim();
    if (slug !== category.slug) {
      const existing = await db.category.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      }
    }
    data.slug = slug;
  }
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.isDeleted !== undefined) data.isDeleted = body.isDeleted;
  if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder);

  const updated = await db.category.update({
    where: { id: categoryId },
    data,
  });

  // Keep legacy Product.category slug in sync with the renamed category.
  if (typeof data.slug === "string" && data.slug !== category.slug) {
    try {
      await db.product.updateMany({
        where: { categoryId },
        data: { category: data.slug as string },
      });
    } catch (error) {
      console.error("[admin/categories PATCH sync products]", error);
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const categoryId = parseInt(id);
  if (isNaN(categoryId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const category = await db.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
    }

    const inUse = await db.product.count({
      where: { categoryId, isDeleted: false },
    });
    if (inUse > 0) {
      return NextResponse.json(
        { error: `Không thể xóa: còn ${inUse} sản phẩm đang dùng danh mục này. Hãy chuyển sản phẩm sang danh mục khác trước.` },
        { status: 409 }
      );
    }

    const deleted = await db.category.update({
      where: { id: categoryId },
      data: { isDeleted: true },
    });

    return NextResponse.json({ ok: true, category: deleted });
  } catch (error) {
    console.error("[admin/categories DELETE]", error);
    return NextResponse.json({ error: "Không thể xóa danh mục" }, { status: 500 });
  }
}
