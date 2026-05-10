import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminRateGuard } from "@/lib/admin-rate-limit";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const PURPOSE_WHITELIST = ["any", "bieu", "suc-khoe", "uong"];
const PREFERENCE_WHITELIST = ["any", "premium", "easy", "traditional", "strength"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  const { id } = await params;
  const ruleId = parseInt(id);
  if (isNaN(ruleId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const existing = await db.chatbotRule.findUnique({ where: { id: ruleId } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy rule" }, { status: 404 });
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.purpose !== undefined) {
      if (typeof body.purpose !== "string" || !PURPOSE_WHITELIST.includes(body.purpose)) {
        return NextResponse.json({ error: "Mục đích không hợp lệ" }, { status: 400 });
      }
      data.purpose = body.purpose;
    }
    if (body.preference !== undefined) {
      if (body.preference === null) {
        data.preference = null;
      } else if (typeof body.preference !== "string" || !PREFERENCE_WHITELIST.includes(body.preference)) {
        return NextResponse.json({ error: "Sở thích không hợp lệ" }, { status: 400 });
      } else {
        data.preference = body.preference;
      }
    }
    if (body.budgetMin !== undefined) data.budgetMin = body.budgetMin === null ? null : Number(body.budgetMin);
    if (body.budgetMax !== undefined) data.budgetMax = body.budgetMax === null ? null : Number(body.budgetMax);
    if (body.recommendedProducts !== undefined && Array.isArray(body.recommendedProducts)) {
      data.recommendedProducts = body.recommendedProducts.filter(
        (id: unknown) => typeof id === "number" && Number.isInteger(id) && id > 0
      );
    }
    if (body.note !== undefined) data.note = typeof body.note === "string" ? body.note.slice(0, 500) : null;
    if (body.priority !== undefined) data.priority = Number(body.priority) || 0;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    if (
      data.budgetMin != null && data.budgetMax != null &&
      typeof data.budgetMin === "number" && typeof data.budgetMax === "number" &&
      data.budgetMin > data.budgetMax
    ) {
      return NextResponse.json(
        { error: "Ngân sách tối thiểu phải nhỏ hơn ngân sách tối đa" },
        { status: 400 }
      );
    }

    const updated = await db.chatbotRule.update({
      where: { id: ruleId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin/rules PATCH]", error);
    return NextResponse.json({ error: "Không thể cập nhật rule" }, { status: 500 });
  }
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
  const ruleId = parseInt(id);
  if (isNaN(ruleId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const existing = await db.chatbotRule.findUnique({ where: { id: ruleId } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy rule" }, { status: 404 });
    }

    await db.chatbotRule.delete({ where: { id: ruleId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/rules DELETE]", error);
    return NextResponse.json({ error: "Không thể xoá rule" }, { status: 500 });
  }
}
