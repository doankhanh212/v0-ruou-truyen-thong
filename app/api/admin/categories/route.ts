import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const CategoryInput = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(120).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const includeDeleted = request.nextUrl.searchParams.get("includeDeleted") === "true";

  try {
    const categories = await db.category.findMany({
      where: includeDeleted ? {} : { isDeleted: false },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            products: { where: { isDeleted: false } },
          },
        },
      },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[admin/categories GET]", error);
    return NextResponse.json({ error: "Không thể tải danh mục" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = CategoryInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    const { name, isActive, sortOrder } = parsed.data;
    const cleanSlug = slugify(parsed.data.slug || name);
    if (!cleanSlug) {
      return NextResponse.json({ error: "Slug không hợp lệ" }, { status: 400 });
    }

    const duplicateName = await db.category.findFirst({
      where: {
        isDeleted: false,
        name: { equals: name, mode: "insensitive" },
      },
    });
    if (duplicateName) {
      return NextResponse.json({ error: "Tên danh mục đã tồn tại" }, { status: 409 });
    }

    const existing = await db.category.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 409 });
    }

    const category = await db.category.create({
      data: {
        name,
        slug: cleanSlug,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("[admin/categories POST]", error);
    return NextResponse.json({ error: "Không thể tạo danh mục" }, { status: 500 });
  }
}
