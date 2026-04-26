import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { invalidateBannerCache, isBannerPosition, type BannerPosition } from "@/lib/banners";
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  const { id } = await params;
  const bannerId = Number(id);
  if (!Number.isFinite(bannerId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const current = await db.banner.findUnique({ where: { id: bannerId } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  const positionsToInvalidate = new Set<BannerPosition>();
  if (isBannerPosition(current.position)) positionsToInvalidate.add(current.position);

  if (typeof body.title === "string") data.title = trimToNull(body.title, 200);
  if (typeof body.subtitle === "string") data.subtitle = trimToNull(body.subtitle, 1000);
  if (typeof body.imageUrl === "string") {
    const v = trimToNull(body.imageUrl, 500);
    if (!v) return NextResponse.json({ error: "imageUrl cannot be empty" }, { status: 400 });
    data.imageUrl = v;
  }
  if (typeof body.linkUrl === "string") data.linkUrl = trimToNull(body.linkUrl, 500);
  if (typeof body.position === "string") {
    if (!isBannerPosition(body.position)) {
      return NextResponse.json({ error: "Unknown position" }, { status: 400 });
    }
    data.position = body.position;
    positionsToInvalidate.add(body.position);
  }
  if (Number.isFinite(Number(body.sortOrder))) data.sortOrder = Number(body.sortOrder);
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;

  const updated = await db.banner.update({ where: { id: bannerId }, data });
  await Promise.all([...positionsToInvalidate].map((p) => invalidateBannerCache(p)));
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
  const bannerId = Number(id);
  if (!Number.isFinite(bannerId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const current = await db.banner.findUnique({ where: { id: bannerId } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.banner.delete({ where: { id: bannerId } });
  if (isBannerPosition(current.position)) await invalidateBannerCache(current.position);
  return NextResponse.json({ ok: true });
}
