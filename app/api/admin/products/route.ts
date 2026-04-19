import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { invalidateProductCache } from "@/lib/product-cache";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const products = await db.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const body = await request.json();
  const { name, slug, price, priceOld, category, description, imageUrl, tags, inStock, featured, sortOrder, volume, alcohol, origin } = body;

  if (!name || !slug || !price || !category || !imageUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await db.product.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const product = await db.product.create({
    data: {
      name,
      slug,
      price: Number(price),
      priceOld: priceOld ? Number(priceOld) : null,
      category,
      description: description ?? null,
      imageUrl,
      tags: tags ?? [],
      inStock: inStock ?? true,
      featured: featured ?? false,
      sortOrder: sortOrder ?? 0,
      volume: volume ?? null,
      alcohol: alcohol ? Number(alcohol) : null,
      origin: origin ?? null,
    },
  });

  invalidateProductCache();
  return NextResponse.json(product, { status: 201 });
}
