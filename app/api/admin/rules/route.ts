import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const rules = await db.chatbotRule.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ rules });
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  const body = await request.json();
  const { purpose, budgetMin, budgetMax, preference, recommendedProducts, note, priority, isActive } = body;

  if (!purpose) {
    return NextResponse.json({ error: "Missing required field: purpose" }, { status: 400 });
  }

  const rule = await db.chatbotRule.create({
    data: {
      purpose,
      budgetMin: budgetMin ?? null,
      budgetMax: budgetMax ?? null,
      preference: preference ?? null,
      recommendedProducts: recommendedProducts ?? [],
      note: note ?? null,
      priority: priority ?? 0,
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json(rule, { status: 201 });
}
