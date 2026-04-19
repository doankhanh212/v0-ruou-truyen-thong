import { db } from "./db";
import type { Product } from "@prisma/client";

const TTL_MS = 60_000;

let cache: { products: Product[]; expiresAt: number } | null = null;

export async function getCachedProducts(): Promise<Product[]> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.products;
  const products = await db.product.findMany({
    where: { inStock: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  cache = { products, expiresAt: now + TTL_MS };
  return products;
}

export function invalidateProductCache() {
  cache = null;
}
