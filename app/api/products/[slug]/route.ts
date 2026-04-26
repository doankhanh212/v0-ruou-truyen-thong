import { NextRequest, NextResponse } from "next/server";
import { getCatalogProductBySlug } from "@/lib/catalog-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const product = await getCatalogProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("[/api/products/[slug] GET]", error);
    return NextResponse.json(
      { error: "Không thể tải chi tiết sản phẩm" },
      { status: 500 }
    );
  }
}
