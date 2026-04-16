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
  const productId = parseInt(id);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Build update data from provided fields only
  const data: Record<string, unknown> = {};
  const allowedFields = [
    "name", "slug", "price", "priceOld", "category", "description",
    "imageUrl", "tags", "inStock", "featured", "sortOrder", "volume",
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

  if (data.slug && data.slug !== product.slug) {
    const existing = await db.product.findUnique({ where: { slug: data.slug as string } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
  }

  const updated = await db.product.update({
    where: { id: productId },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await db.product.delete({ where: { id: productId } });

  return NextResponse.json({ ok: true });
}
