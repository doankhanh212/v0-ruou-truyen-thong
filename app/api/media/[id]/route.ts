import { NextRequest, NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const mediaId = parseInt(id);
  if (isNaN(mediaId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const media = await db.media.findUnique({ where: { id: mediaId } });
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (media.url.startsWith("/uploads/")) {
    const filename = path.basename(media.url);
    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    await unlink(filePath).catch(() => {
      // file might already be gone — continue with DB delete
    });
  }

  await db.media.delete({ where: { id: mediaId } });
  return NextResponse.json({ ok: true });
}
