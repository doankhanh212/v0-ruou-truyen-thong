import type { Product, ChatbotRule } from "@prisma/client";
import {
  detectBudget,
  detectIntent,
  detectNamedSlugs,
  detectPreference,
  type BudgetId,
  type IntentId,
  type PreferenceId,
} from "./chatbot-rules";

export interface ChatbotMatchInput {
  query?: string;
  intent: IntentId;
  budget: BudgetId;
  preference: PreferenceId | null;
}

const BUDGET_RANGE: Record<Exclude<BudgetId, "unknown">, { min: number; max: number }> = {
  "under-1m": { min: 0, max: 999_999 },
  "between-1m-2m": { min: 1_000_000, max: 2_000_000 },
  "over-2m": { min: 2_000_001, max: Number.POSITIVE_INFINITY },
};

const INTENT_CATEGORY: Record<IntentId, string[]> = {
  gift: ["qua-tang"],
  health: ["ruou-thuoc"],
  male: ["ruou-thuoc"],
  daily: ["ruou-nep", "ruou-trai-cay"],
  unknown: [],
};

const INTENT_TAGS: Record<IntentId, string[]> = {
  gift: ["biếu", "cao cấp", "combo"],
  health: ["sức khỏe", "cao cấp"],
  male: ["sinh lực", "sức khỏe"],
  daily: ["đặc sản", "uống", "nhẹ"],
  unknown: [],
};

const PREFERENCE_TAGS: Record<PreferenceId, string[]> = {
  premium: ["cao cấp", "biếu", "combo"],
  easy: ["nhẹ", "trái cây"],
  traditional: ["đặc sản", "uống"],
  strength: ["sinh lực", "sức khỏe"],
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

function hasAny(haystack: string[], needles: string[]) {
  if (needles.length === 0) return false;
  const norm = haystack.map(normalizeText);
  return needles.some((n) => norm.includes(normalizeText(n)));
}

function scoreProduct(product: Product, input: ChatbotMatchInput, namedSlugs: string[]) {
  let score = 0;

  if (input.budget !== "unknown") {
    const range = BUDGET_RANGE[input.budget];
    if (product.price >= range.min && product.price <= range.max) score += 4;
  } else {
    score += 2;
  }

  const intentCats = INTENT_CATEGORY[input.intent];
  if (intentCats.includes(product.category)) score += 5;
  if (hasAny(product.tags, INTENT_TAGS[input.intent])) score += 4;

  if (input.preference) {
    if (hasAny(product.tags, PREFERENCE_TAGS[input.preference])) score += 4;
  }

  if (input.intent === "gift" && product.category === "qua-tang") score += 6;
  if (input.preference === "premium" && product.category === "qua-tang") score += 2;

  if (namedSlugs.includes(product.slug)) score += 12;
  if (product.featured) score += 1;

  return score;
}

export function detectFromQuery(query: string | undefined) {
  if (!query || !query.trim()) {
    return { intent: "unknown" as IntentId, budget: "unknown" as BudgetId, preference: null };
  }
  return {
    intent: detectIntent(query),
    budget: detectBudget(query),
    preference: detectPreference(query),
  };
}

function ruleBudgetMatches(rule: ChatbotRule, budget: BudgetId, priceHint?: number) {
  if (rule.budgetMin === null && rule.budgetMax === null) return true;

  let probePrice: number | null = null;
  if (typeof priceHint === "number") probePrice = priceHint;
  else if (budget !== "unknown") {
    const r = BUDGET_RANGE[budget];
    probePrice = Math.round((r.min + Math.min(r.max, 5_000_000)) / 2);
  }

  if (probePrice === null) return true;
  if (rule.budgetMin !== null && probePrice < rule.budgetMin) return false;
  if (rule.budgetMax !== null && probePrice > rule.budgetMax) return false;
  return true;
}

const INTENT_TO_PURPOSE: Record<IntentId, string> = {
  gift: "bieu",
  health: "suc-khoe",
  male: "suc-khoe",
  daily: "uong",
  unknown: "any",
};

export function findAdminOverride(
  rules: ChatbotRule[],
  input: ChatbotMatchInput
): ChatbotRule | null {
  const purposeKey = INTENT_TO_PURPOSE[input.intent];
  const active = rules.filter((r) => r.isActive);
  const candidates = active.filter((r) => {
    if (r.purpose !== "any" && r.purpose !== purposeKey) return false;
    if (!ruleBudgetMatches(r, input.budget)) return false;
    if (r.preference && r.preference !== "any") {
      if (!input.preference || r.preference !== input.preference) return false;
    }
    return true;
  });
  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => b.priority - a.priority)[0];
}

export function matchProductsFromDb(
  products: Product[],
  rules: ChatbotRule[],
  input: ChatbotMatchInput
): { items: Product[]; overriddenByRule: ChatbotRule | null } {
  const namedSlugs = input.query ? detectNamedSlugs(input.query) : [];

  const override = findAdminOverride(rules, input);
  if (override && override.recommendedProducts.length > 0) {
    const byId = new Map(products.map((p) => [p.id, p]));
    const ordered = override.recommendedProducts
      .map((id) => byId.get(id))
      .filter((p): p is Product => Boolean(p));
    if (ordered.length > 0) {
      return { items: ordered.slice(0, 3), overriddenByRule: override };
    }
  }

  const scored = [...products]
    .map((p) => ({ product: p, score: scoreProduct(p, input, namedSlugs) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const nameDelta = Number(namedSlugs.includes(b.product.slug)) - Number(namedSlugs.includes(a.product.slug));
      if (nameDelta !== 0) return nameDelta;
      return a.product.price - b.product.price;
    });

  return { items: scored.slice(0, 3).map((s) => s.product), overriddenByRule: null };
}
