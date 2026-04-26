import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const querySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // 1. Auth
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limit (fails open if Redis unavailable)
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const { success } = await rateLimit(`analytics_api_${ip}`, 10, 60);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    // 3. Parse & validate date range
    const { searchParams } = request.nextUrl;
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Vietnam timezone is fixed UTC+7 (no DST). Treat the date strings as
    // Hanoi-local days so the boundaries match what the admin sees in the picker.
    const VN_OFFSET = "+07:00";
    const fromDate = parsed.data.from
      ? new Date(`${parsed.data.from}T00:00:00.000${VN_OFFSET}`)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const toDate = parsed.data.to
      ? new Date(`${parsed.data.to}T23:59:59.999${VN_OFFSET}`)
      : new Date();

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime()) || fromDate > toDate) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    const dateWhere = { createdAt: { gte: fromDate, lte: toDate } } as const;

    // 4. Overview — group by `event` (the actual schema field name)
    const eventCounts = await db.trackingLog.groupBy({
      by: ["event"],
      where: dateWhere,
      _count: { _all: true },
    });

    const overview = {
      totalViews: 0,
      totalZaloClicks: 0,
      totalCalls: 0,
      conversionRate: 0,
    };
    for (const row of eventCounts) {
      if (row.event === "page_view") overview.totalViews = row._count._all;
      if (row.event === "click_zalo") overview.totalZaloClicks = row._count._all;
      if (row.event === "click_call") overview.totalCalls = row._count._all;
    }
    overview.conversionRate =
      overview.totalViews > 0
        ? Number(
            ((overview.totalZaloClicks / overview.totalViews) * 100).toFixed(2)
          )
        : 0;

    // 5. Traffic by day — bucket by Hanoi local day so the chart matches the picker.
    const trafficRaw = await db.$queryRaw<
      { date: string; views: bigint; zalo: bigint; calls: bigint }[]
    >`
      SELECT
        TO_CHAR(("createdAt" AT TIME ZONE 'Asia/Ho_Chi_Minh')::date, 'YYYY-MM-DD') AS date,
        SUM(CASE WHEN event = 'page_view'  THEN 1 ELSE 0 END)::int AS views,
        SUM(CASE WHEN event = 'click_zalo' THEN 1 ELSE 0 END)::int AS zalo,
        SUM(CASE WHEN event = 'click_call' THEN 1 ELSE 0 END)::int AS calls
      FROM "TrackingLog"
      WHERE "createdAt" >= ${fromDate} AND "createdAt" <= ${toDate}
      GROUP BY ("createdAt" AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
      ORDER BY ("createdAt" AT TIME ZONE 'Asia/Ho_Chi_Minh')::date ASC
    `;

    const trafficByDay = trafficRaw.map((row) => ({
      date: row.date,
      views: Number(row.views ?? 0),
      zalo: Number(row.zalo ?? 0),
      calls: Number(row.calls ?? 0),
    }));

    // 6. Top products — group by `productId` (the actual schema field)
    //    Event `click_product` carries a numeric productId set by utils/track.ts
    const topProductGroups = await db.trackingLog.groupBy({
      by: ["productId"],
      where: {
        event: "click_product",
        productId: { not: null },
        ...dateWhere,
      },
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    });

    const productIds = topProductGroups
      .map((g) => g.productId)
      .filter((id): id is number => id !== null);

    const productRows = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, slug: true },
    });

    const productById = new Map(productRows.map((p) => [p.id, p]));

    const topProducts = topProductGroups
      .map((g) => {
        const product = productById.get(g.productId!);
        if (!product) return null;
        return {
          id: product.id,
          name: product.name,
          views: g._count.productId,
          clicks: g._count.productId,
        };
      })
      .filter(Boolean)
      .slice(0, 5);

    return NextResponse.json({
      overview,
      trafficByDay,
      topProducts,
      topPosts: [],
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        route: "/api/admin/analytics",
        method: "GET",
        error: String(error),
      })
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
