import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const ruleId = parseInt(id);
  if (isNaN(ruleId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await db.chatbotRule.findUnique({ where: { id: ruleId } });
  if (!existing) {
    return NextResponse.json({ error: "Rule not found" }, { status: 404 });
  }

  const body = await request.json();
  const data: Record<string, unknown> = {};
  const allowedFields = [
    "purpose", "budgetMin", "budgetMax", "preference",
    "recommendedProducts", "note", "priority", "isActive",
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  const updated = await db.chatbotRule.update({
    where: { id: ruleId },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const ruleId = parseInt(id);
  if (isNaN(ruleId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await db.chatbotRule.findUnique({ where: { id: ruleId } });
  if (!existing) {
    return NextResponse.json({ error: "Rule not found" }, { status: 404 });
  }

  await db.chatbotRule.delete({ where: { id: ruleId } });

  return NextResponse.json({ ok: true });
}
