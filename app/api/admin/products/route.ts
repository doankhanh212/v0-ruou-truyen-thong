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

// Plain-text alt: strip any HTML tags & control chars, then bound length.
// Block < and > entirely so even encoded entities cannot reach an HTML context.
const altSchema = z
  .string()
  .trim()
  .min(3, "Alt text phải có ít nhất 3 ký tự")
  .max(160, "Alt text tối đa 160 ký tự")
  // Reject angle brackets, raw quotes, and ASCII control chars. React
  // already escapes attribute values, but defense-in-depth keeps the column
  // free of anything that could break out of an HTML context later (e.g. if
  // someone exports the data into a different template engine).
  .refine((v) => !/[<>"\x00-\x1f]/.test(v), "Alt text chứa ký tự không hợp lệ");

export const VariantSchema = z.object({
  size: z.string().trim().min(1).max(50),
  price: z.coerce.number().int().nonnegative(),
});
export type Variant = z.infer<typeof VariantSchema>;

const ProductInput = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(200).optional(),
  price: z.coerce.number().int().nonnegative(),
  priceOld: z.coerce.number().int().nonnegative().nullable().optional(),
  categoryId: z.coerce.number().int().positive(),
  description: z.string().max(10_000).nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  imageAlt: altSchema,
  imageUrls: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  volume: z.string().nullable().optional(),
  alcohol: z.coerce.number().nullable().optional(),
  origin: z.string().nullable().optional(),
  variants: z.array(VariantSchema).nullable().optional(),
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

    const userSlug = slugify(data.slug ?? "");
    const baseSlug = userSlug || slugify(data.name);
    if (!baseSlug) {
      return NextResponse.json({ error: "Slug không hợp lệ" }, { status: 400 });
    }

    // Kịch bản 1: người dùng tự nhập slug → báo lỗi nếu trùng
    // Kịch bản 2: hệ thống tự sinh từ tên → tự thêm hậu tố -1, -2, ...
    const userProvidedSlug = Boolean(userSlug);

    const [existingForUserSlug, category] = await Promise.all([
      userProvidedSlug
        ? db.product.findUnique({ where: { slug: baseSlug } })
        : Promise.resolve(null),
      db.category.findFirst({
        where: { id: data.categoryId, isDeleted: false },
        select: { id: true, slug: true },
      }),
    ]);
    if (userProvidedSlug && existingForUserSlug) {
      return NextResponse.json({ error: "Đường dẫn này đã tồn tại, vui lòng chọn tên khác" }, { status: 409 });
    }
    if (!category) {
      return NextResponse.json({ error: "Danh mục không hợp lệ" }, { status: 400 });
    }

    // Với slug tự sinh: tìm suffix chưa trùng
    let cleanSlug = baseSlug;
    if (!userProvidedSlug) {
      const conflicting = await db.product.findMany({
        where: { slug: { startsWith: baseSlug } },
        select: { slug: true },
      });
      const taken = new Set(conflicting.map((p) => p.slug));
      if (taken.has(baseSlug)) {
        let n = 1;
        while (taken.has(`${baseSlug}-${n}`)) n++;
        cleanSlug = `${baseSlug}-${n}`;
      }
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
        imageAlt: data.imageAlt,
        tags: data.tags ?? [],
        inStock: data.inStock ?? true,
        featured: data.featured ?? false,
        isDeleted: false,
        sortOrder: data.sortOrder ?? 0,
        volume: data.volume ?? null,
        alcohol: data.alcohol ?? null,
        origin: data.origin ?? null,
        variants: data.variants && data.variants.length > 0 ? data.variants : [],
        images: { create: normalizedImages.records },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[admin/products POST]", error);
    return NextResponse.json({ error: "Không thể tạo sản phẩm" }, { status: 500 });
  }
}
