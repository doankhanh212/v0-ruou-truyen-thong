import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { event, sessionId, productId, metadata } = body;

  if (!event || !sessionId) {
    return NextResponse.json({ error: "Missing event or sessionId" }, { status: 400 });
  }

  await db.trackingLog.create({
    data: {
      event,
      sessionId,
      productId: productId ?? null,
      metadata: metadata ?? null,
      userAgent: request.headers.get("user-agent") ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
