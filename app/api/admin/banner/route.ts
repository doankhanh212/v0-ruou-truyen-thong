import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  BANNER_POSITIONS,
  invalidateBannerCache,
  isBannerPosition,
} from "@/lib/banners";
import { adminRateGuard } from "@/lib/admin-rate-limit";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function trimToNull(raw: unknown, max: number): string | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim().slice(0, max);
  return v || null;
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const banners = await db.banner.findMany({
    orderBy: [{ position: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ banners, positions: BANNER_POSITIONS });
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const imageUrl = trimToNull((body as Record<string, unknown>).imageUrl, 500);
  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
  }

  const positionRaw = typeof body.position === "string" ? body.position : "home_hero";
  if (!isBannerPosition(positionRaw)) {
    return NextResponse.json({ error: "Unknown position" }, { status: 400 });
  }

  const banner = await db.banner.create({
    data: {
      imageUrl,
      position: positionRaw,
      title: trimToNull(body.title, 200),
      subtitle: trimToNull(body.subtitle, 1000),
      linkUrl: trimToNull(body.linkUrl, 500),
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
      isActive: typeof body.isActive === "boolean" ? body.isActive : true,
    },
  });

  await invalidateBannerCache(positionRaw);
  return NextResponse.json(banner, { status: 201 });
}
