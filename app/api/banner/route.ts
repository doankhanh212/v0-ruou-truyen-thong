import { NextRequest, NextResponse } from "next/server";
import { getActiveBanners, isBannerPosition } from "@/lib/banners";

export async function GET(request: NextRequest) {
  const positionParam = request.nextUrl.searchParams.get("position") ?? "home_hero";
  if (!isBannerPosition(positionParam)) {
    return NextResponse.json({ error: "Unknown position" }, { status: 400 });
  }
  const banners = await getActiveBanners(positionParam);
  return NextResponse.json({ banners });
}
