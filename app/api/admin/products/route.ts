import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeProductImages } from "@/lib/product-images";
import { slugify } from "@/lib/slug";
import { adminRateGuard } from "@/lib/admin-rate-limit";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const ProductInput = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200),
  price: z.coerce.number().int().nonnegative(),
  priceOld: z.coerce.number().int().nonnegative().nullable().optional(),
  categoryId: z.coerce.number().int().positive(),
  description: z.string().max(10_000).nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  imageUrls: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  volume: z.string().nullable().optional(),
  alcohol: z.coerce.number().nullable().optional(),
  origin: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const includeDeleted = request.nextUrl.searchParams.get("includeDeleted") === "true";

  try {
    const allProducts = await db.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        images: { orderBy: [{ sortOrder: "asc" }] },
        categoryRel: { select: { id: true, name: true, slug: true } },
      } as never,
    });

    const products = includeDeleted
      ? allProducts
      : allProducts.filter((product) => !(product as unknown as { isDeleted: boolean }).isDeleted);

    return NextResponse.json({ products });
  } catch (error) {
    console.error("[admin/products GET]", error);
    return NextResponse.json({ error: "Không thể tải sản phẩm" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = ProductInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parsed.error.issues.map((i) => i.message) },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const cleanSlug = slugify(data.slug) || slugify(data.name);
    if (!cleanSlug) {
      return NextResponse.json({ error: "Slug không hợp lệ" }, { status: 400 });
    }

    const [existing, category] = await Promise.all([
      db.product.findUnique({ where: { slug: cleanSlug } }),
      db.category.findFirst({
        where: { id: data.categoryId, isDeleted: false },
        select: { id: true, slug: true },
      }),
    ]);
    if (existing) {
      return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 409 });
    }
    if (!category) {
      return NextResponse.json({ error: "Danh mục không hợp lệ" }, { status: 400 });
    }

    const normalizedImages = normalizeProductImages(data.imageUrl ?? null, data.imageUrls ?? []);
    if (!normalizedImages) {
      return NextResponse.json({ error: "Sản phẩm phải có ít nhất 1 ảnh chính" }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        name: data.name,
        slug: cleanSlug,
        price: data.price,
        priceOld: data.priceOld ?? null,
        category: category.slug,
        categoryId: category.id,
        description: data.description ?? null,
        imageUrl: normalizedImages.imageUrl,
        tags: data.tags ?? [],
        inStock: data.inStock ?? true,
        featured: data.featured ?? false,
        isDeleted: false,
        sortOrder: data.sortOrder ?? 0,
        volume: data.volume ?? null,
        alcohol: data.alcohol ?? null,
        origin: data.origin ?? null,
        images: { create: normalizedImages.records },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[admin/products POST]", error);
    return NextResponse.json({ error: "Không thể tạo sản phẩm" }, { status: 500 });
  }
}
