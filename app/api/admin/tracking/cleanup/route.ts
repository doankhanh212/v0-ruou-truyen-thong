import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { cleanupOldTrackingLogs } from "@/lib/tracking-cleanup";

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await cleanupOldTrackingLogs(30);

  return NextResponse.json({ ok: true, deleted });
}
