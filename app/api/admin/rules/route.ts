import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminRateGuard } from "@/lib/admin-rate-limit";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * Whitelisted purposes — must match `INTENT_TO_PURPOSE` in
 * `app/api/chatbot/match/route.ts`. Any other value is rejected.
 */
const PURPOSE_WHITELIST = ["any", "bieu", "suc-khoe", "uong"] as const;
const PREFERENCE_WHITELIST = ["any", "premium", "easy", "traditional", "strength"] as const;

const RuleInput = z.object({
  purpose: z.enum(PURPOSE_WHITELIST),
  budgetMin: z.number().int().nonnegative().nullable().optional(),
  budgetMax: z.number().int().nonnegative().nullable().optional(),
  preference: z.enum(PREFERENCE_WHITELIST).nullable().optional(),
  recommendedProducts: z.array(z.number().int().positive()).optional(),
  note: z.string().max(500).nullable().optional(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const rules = await db.chatbotRule.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ rules });
  } catch (error) {
    console.error("[admin/rules GET]", error);
    return NextResponse.json({ error: "Không thể tải danh sách rule" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = RuleInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parsed.error.issues.map((i) => i.message) },
        { status: 400 }
      );
    }
    const data = parsed.data;

    if (data.budgetMin != null && data.budgetMax != null && data.budgetMin > data.budgetMax) {
      return NextResponse.json(
        { error: "Ngân sách tối thiểu phải nhỏ hơn ngân sách tối đa" },
        { status: 400 }
      );
    }

    const rule = await db.chatbotRule.create({
      data: {
        purpose: data.purpose,
        budgetMin: data.budgetMin ?? null,
        budgetMax: data.budgetMax ?? null,
        preference: data.preference ?? null,
        recommendedProducts: data.recommendedProducts ?? [],
        note: data.note ?? null,
        priority: data.priority ?? 0,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("[admin/rules POST]", error);
    return NextResponse.json({ error: "Không thể tạo rule" }, { status: 500 });
  }
}
