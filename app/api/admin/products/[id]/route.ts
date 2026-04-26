import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSecondaryProductImageUrls, normalizeProductImages } from "@/lib/product-images";
import { adminRateGuard } from "@/lib/admin-rate-limit";

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
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();

  const product = await db.product.findUnique({
    where: { id: productId },
    include: { images: { orderBy: [{ sortOrder: "asc" }] } },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Build update data from provided fields only
  const data: Record<string, unknown> = {};
  const allowedFields = [
    "name", "slug", "price", "priceOld", "description",
    "imageUrl", "tags", "inStock", "featured", "isDeleted", "sortOrder", "volume",
    "alcohol", "origin",
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      if (field === "price" || field === "priceOld" || field === "sortOrder") {
        data[field] = body[field] !== null ? Number(body[field]) : null;
      } else if (field === "alcohol") {
        data[field] = body[field] !== null ? Number(body[field]) : null;
      } else {
        data[field] = body[field];
      }
    }
  }

  if (body.categoryId !== undefined && body.categoryId !== null) {
    const categoryId = Number(body.categoryId);
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json({ error: "categoryId không hợp lệ" }, { status: 400 });
    }
    const category = await db.category.findFirst({
      where: { id: categoryId, isDeleted: false },
      select: { id: true, slug: true },
    });
    if (!category) {
      return NextResponse.json({ error: "Danh mục không hợp lệ" }, { status: 400 });
    }
    data.categoryId = category.id;
    data.category = category.slug;
  }

  if (data.slug && data.slug !== product.slug) {
    const existing = await db.product.findUnique({ where: { slug: data.slug as string } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
  }

  const shouldSyncImages = body.imageUrl !== undefined || body.imageUrls !== undefined || product.images.length === 0;
  const currentSecondaryUrls = getSecondaryProductImageUrls(product.imageUrl, product.images);
  const normalizedImages = shouldSyncImages
    ? normalizeProductImages(
        body.imageUrl !== undefined ? body.imageUrl : product.imageUrl,
        body.imageUrls !== undefined ? body.imageUrls : currentSecondaryUrls
      )
    : null;

  if (shouldSyncImages && !normalizedImages) {
    return NextResponse.json({ error: "Product must have at least 1 primary image" }, { status: 400 });
  }

  if (normalizedImages) {
    data.imageUrl = normalizedImages.imageUrl;
  }

  const updated = await db.product.update({
    where: { id: productId },
    data,
  });

  // Sync gallery images if provided
  if (normalizedImages) {
    await db.productImage.deleteMany({ where: { productId } });
    if (normalizedImages.records.length > 0) {
      await db.productImage.createMany({
        data: normalizedImages.records.map((image) => ({
          productId,
          url: image.url,
          isPrimary: image.isPrimary,
          sortOrder: image.sortOrder,
        })),
      });
    }
  }

  return NextResponse.json(updated);
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
  const productId = parseInt(id);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const deleted = await db.product.update({
    where: { id: productId },
    data: { isDeleted: true },
  });

  return NextResponse.json({ ok: true, product: deleted });
}
