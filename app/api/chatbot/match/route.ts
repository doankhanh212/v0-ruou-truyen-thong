import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  detectBudget,
  detectIntent,
  detectPreference,
  type BudgetId,
  type IntentId,
  type PreferenceId,
} from "@/lib/chatbot-rules";
import { rateLimit } from "@/lib/rate-limit";

// --- Rate limit -----------------------------------------------------------
const RATE_LIMIT = { limit: 20, windowSeconds: 60 };

function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") || "127.0.0.1";
}

// --- Input validation -----------------------------------------------------
const MatchInput = z.object({
  query: z.string().max(500).optional(),
  purpose: z.string().max(40).optional(),
  budget: z.string().max(40).optional(),
  preference: z.string().max(40).optional(),
});

function normalizeBudget(raw: string | undefined): BudgetId | undefined {
  if (!raw) return undefined;
  if (raw === "under-1m" || raw === "between-1m-2m" || raw === "over-2m" || raw === "unknown") return raw;
  return detectBudget(raw);
}

function normalizePreference(raw: string | undefined): PreferenceId | undefined {
  if (!raw) return undefined;
  if (raw === "premium" || raw === "easy" || raw === "traditional" || raw === "strength") return raw;
  return detectPreference(raw) ?? undefined;
}

function normalizeIntent(raw: string | undefined): IntentId | undefined {
  if (!raw) return undefined;
  if (raw === "gift" || raw === "health" || raw === "male" || raw === "daily" || raw === "unknown") return raw;
  return detectIntent(raw);
}

const INTENT_TO_PURPOSE: Record<IntentId, string> = {
  gift: "bieu",
  health: "suc-khoe",
  male: "suc-khoe",
  daily: "uong",
  unknown: "any",
};

const INTENT_TO_CATEGORY_SLUGS: Record<IntentId, string[] | null> = {
  gift: ["qua-tang"],
  health: ["ruou-thuoc"],
  male: ["ruou-thuoc"],
  daily: ["ruou-nep", "ruou-trai-cay"],
  unknown: null,
};

const BUDGET_RANGE: Record<Exclude<BudgetId, "unknown">, { min: number; max: number }> = {
  "under-1m": { min: 0, max: 1_000_000 },
  "between-1m-2m": { min: 1_000_000, max: 2_000_000 },
  "over-2m": { min: 2_000_000, max: 9_999_999_999 },
};

// --- Script loader --------------------------------------------------------
async function loadScripts(keys: string[]): Promise<Record<string, string>> {
  const rows = await db.chatbotScript.findMany({
    where: { key: { in: keys }, isActive: true },
    select: { key: true, content: true },
  });
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.content;
  return map;
}

function script(
  map: Record<string, string>,
  key: string,
  fallback = ""
): string {
  return map[key]?.trim() || fallback;
}

// --- Product matcher ------------------------------------------------------
async function matchProducts(input: {
  intent: IntentId;
  budget: BudgetId;
  preference: PreferenceId | null;
  query?: string;
}) {
  // 1) Admin override via ChatbotRule (highest priority)
  const rules = await db.chatbotRule.findMany({
    where: { isActive: true },
    orderBy: [{ priority: "desc" }],
  });
  const purposeKey = INTENT_TO_PURPOSE[input.intent];
  const budgetProbe = input.budget !== "unknown" ? BUDGET_RANGE[input.budget] : null;

  for (const rule of rules) {
    if (rule.purpose !== "any" && rule.purpose !== purposeKey) continue;
    if (rule.preference && rule.preference !== "any" && input.preference && rule.preference !== input.preference) continue;
    if (budgetProbe) {
      if (rule.budgetMin !== null && budgetProbe.max < rule.budgetMin) continue;
      if (rule.budgetMax !== null && budgetProbe.min > rule.budgetMax) continue;
    }
    if (rule.recommendedProducts.length > 0) {
      const products = await db.product.findMany({
        where: {
          id: { in: rule.recommendedProducts },
          inStock: true,
          isDeleted: false,
        },
        include: { categoryRel: { select: { slug: true, name: true } } },
      });
      if (products.length > 0) {
        const ordered = rule.recommendedProducts
          .map((id) => products.find((p) => p.id === id))
          .filter((p): p is (typeof products)[number] => Boolean(p))
          .slice(0, 3);
        return { items: ordered, overriddenByRuleId: rule.id };
      }
    }
  }

  // 2) Heuristic match from DB
  const categorySlugs = INTENT_TO_CATEGORY_SLUGS[input.intent];
  const where: Record<string, unknown> = {
    inStock: true,
    isDeleted: false,
  };
  if (categorySlugs) {
    where.categoryRel = { slug: { in: categorySlugs } };
  }
  if (budgetProbe) {
    where.price = { gte: budgetProbe.min, lte: budgetProbe.max };
  }

  const items = await db.product.findMany({
    where,
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    take: 3,
    include: { categoryRel: { select: { slug: true, name: true } } },
  });

  return { items, overriddenByRuleId: null };
}

// --- Route handler --------------------------------------------------------
export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);
  const result = await rateLimit(`chatbot:${ip}`, RATE_LIMIT.limit, RATE_LIMIT.windowSeconds);
  if (!result.success) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút." },
      {
        status: 429,
        headers: {
          "Retry-After": String(RATE_LIMIT.windowSeconds),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const rawBody = await request.json().catch(() => ({}));
    const parsed = MatchInput.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    const { query, purpose, budget, preference } = parsed.data;

    let intent: IntentId = "unknown";
    let budgetId: BudgetId = "unknown";
    let preferenceId: PreferenceId | null = null;

    if (query && query.trim()) {
      intent = detectIntent(query);
      budgetId = detectBudget(query);
      preferenceId = detectPreference(query);
    }
    if (intent === "unknown") {
      const fallback = normalizeIntent(purpose);
      if (fallback) intent = fallback;
    }
    if (budgetId === "unknown") {
      const fallback = normalizeBudget(budget);
      if (fallback) budgetId = fallback;
    }
    if (!preferenceId) {
      const fallback = normalizePreference(preference);
      if (fallback) preferenceId = fallback;
    }

    const { items, overriddenByRuleId } = await matchProducts({
      intent,
      budget: budgetId,
      preference: preferenceId,
      query: query?.trim() || undefined,
    });

    const scripts = await loadScripts([
      `intent.intro.${intent}`,
      `intent.followup.${intent}`,
      `intent.cta.${intent}`,
      "intent.intro.unknown",
      "intent.followup.unknown",
      "intent.cta.unknown",
    ]);

    const intro = script(scripts, `intent.intro.${intent}`, script(scripts, "intent.intro.unknown"));
    const followUp = script(scripts, `intent.followup.${intent}`, script(scripts, "intent.followup.unknown"));
    const ctaText = script(scripts, `intent.cta.${intent}`, script(scripts, "intent.cta.unknown"));

    const zaloPhone = process.env.ZALO_PHONE || "";
    const topNames = items.map((p) => p.name);
    const zaloText = items.length
      ? `Xin chào, mình muốn tư vấn: ${topNames.join(", ")}`
      : "Xin chào, mình cần tư vấn chọn rượu phù hợp";
    const zaloCTA = zaloPhone
      ? `https://zalo.me/${zaloPhone}?text=${encodeURIComponent(zaloText)}`
      : null;

    return NextResponse.json(
      {
        matched: items.length > 0,
        intent,
        budget: budgetId,
        preference: preferenceId,
        overriddenByRule: overriddenByRuleId,
        items: items.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          image: p.imageUrl,
          category: p.categoryRel?.slug ?? null,
        })),
        intro,
        followUp,
        ctaText,
        zaloCTA,
      },
      {
        headers: {
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
        },
      }
    );
  } catch (error) {
    console.error("[chatbot/match]", error);
    return NextResponse.json(
      { error: "Không thể tải tư vấn" },
      { status: 500 }
    );
  }
}
