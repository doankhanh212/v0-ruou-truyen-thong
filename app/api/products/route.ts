import { NextRequest, NextResponse } from "next/server";
import { listCatalogProducts } from "@/lib/catalog-service";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

export const revalidate = 60; // Next.js App Router cache standard

const querySchema = z.object({
  category: z.string().optional(),
  featured: z.enum(["true", "false"]).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const { success } = await rateLimit(`products_api_${ip}`, 30, 60);

    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const { searchParams } = request.nextUrl;
    
    const parsedQuery = querySchema.safeParse({
      category: searchParams.get("category") || undefined,
      featured: searchParams.get("featured") || undefined,
      search: (searchParams.get("q") || searchParams.get("search"))?.trim() || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    if (!parsedQuery.success) {
      console.warn(JSON.stringify({ route: "/api/products", error: "Validation Failed", details: parsedQuery.error.format() }));
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const { category, featured, search, page, limit } = parsedQuery.data;

    const response = await listCatalogProducts({
      category,
      featured: featured === "true",
      search,
      page,
      limit,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error(JSON.stringify({ route: "/api/products", method: "GET", error: error instanceof Error ? error.message : String(error) }));
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
