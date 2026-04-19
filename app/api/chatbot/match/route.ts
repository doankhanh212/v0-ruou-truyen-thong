import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCachedProducts } from "@/lib/product-cache";
import {
  detectBudget,
  detectIntent,
  detectPreference,
  type BudgetId,
  type IntentId,
  type PreferenceId,
} from "@/lib/chatbot-rules";
import { matchProductsFromDb } from "@/lib/chatbot-db";

const INTENT_INTRO: Record<IntentId, string> = {
  gift: "Với nhu cầu biếu tặng, bên mình xin gợi ý vài bộ quà hiện đang có sẵn, hỗ trợ giao nhanh và đóng gói chỉn chu — rất phù hợp biếu đối tác, gia đình",
  health: "Về dòng bồi bổ, theo Đông y các dược liệu trong các sản phẩm này thường được sử dụng để hỗ trợ sức khỏe. Bên mình hiện đang có sẵn hàng, hỗ trợ giao nhanh",
  male: "Cho nam giới, Cửu Long có các dòng cổ phương thường được sử dụng để hỗ trợ sinh lực, hiện đang có sẵn và hỗ trợ giao nhanh trong ngày",
  daily: "Nếu anh/chị dùng hằng ngày, các dòng rượu nếp truyền thống vừa êm vừa hợp túi tiền, hiện đang có sẵn và hỗ trợ giao nhanh",
  unknown: "Dựa trên catalog hiện tại, bên mình xin gợi ý vài lựa chọn được nhiều khách chọn nhất — các mẫu này hiện đang có sẵn, hỗ trợ giao nhanh",
};

const BUDGET_NOTE: Record<Exclude<BudgetId, "unknown">, string> = {
  "under-1m": "(trong tầm giá dưới 1 triệu)",
  "between-1m-2m": "(khoảng 1–2 triệu)",
  "over-2m": "(phân khúc trên 2 triệu, cao cấp hơn)",
};

const PREFERENCE_NOTE: Record<PreferenceId, string> = {
  premium: "ưu tiên cảm giác sang trọng",
  easy: "thiên hướng dễ uống, nhẹ nhàng",
  traditional: "giữ nguyên phong vị truyền thống",
  strength: "nhấn mạnh cổ phương nam giới",
};

function buildMessage(
  intent: IntentId,
  budget: BudgetId,
  preference: PreferenceId | null,
  itemNames: string[]
) {
  const intro = INTENT_INTRO[intent] ?? INTENT_INTRO.unknown;
  const budgetText = budget !== "unknown" ? ` ${BUDGET_NOTE[budget]}` : "";
  const prefText = preference ? `, ${PREFERENCE_NOTE[preference]}` : "";
  const list = itemNames.length > 0 ? `: ${itemNames.join(", ")}` : "";
  const nudge = " Anh/chị nhắn Zalo để mình tư vấn kỹ hơn và giữ giá tốt nhất trong hôm nay nhé.";
  return `${intro}${budgetText}${prefText}${list}.${nudge}`;
}

const FOLLOW_UP: Record<IntentId, string> = {
  gift: "Anh/chị đang cần biếu dịp nào ạ — Tết, sinh nhật sếp hay quà doanh nghiệp? Cho mình biết để chọn bộ ưng ý nhất và gửi báo giá theo số lượng nhé.",
  health: "Anh/chị mua dùng cho bản thân hay biếu ạ? Nhắn giúp mình độ tuổi và mong muốn, mình sẽ tư vấn liều dùng phù hợp và giữ hàng trước.",
  male: "Anh/chị đang ưu tiên hương vị cổ phương hay thiên hướng dễ uống hơn? Nhắn Zalo để mình chọn đúng dòng và gửi giá ưu đãi theo số lượng.",
  daily: "Anh/chị thường dùng trong bữa cơm hay dịp tụ họp ạ? Cho mình biết dung tích ưng ý, mình sẽ chốt mẫu hợp khẩu vị và báo giá tốt nhất.",
  unknown: "Anh/chị cho mình biết đang cần cho dịp gì hoặc khoảng ngân sách nhé, mình sẽ chọn mẫu chuẩn và gửi báo giá ưu đãi qua Zalo ngay.",
};

const SECONDARY_PUSH: Record<IntentId, string> = {
  gift: "Các bộ quà hiện đang có sẵn, hỗ trợ giao nhanh trong ngày và tặng kèm túi quà sang trọng. Anh/chị bấm Zalo bên dưới để mình giữ hàng trước giúp nhé.",
  health: "Các dòng này theo Đông y thường được sử dụng để hỗ trợ sức khỏe, hiện có sẵn số lượng giới hạn. Anh/chị nhắn Zalo để mình tư vấn kỹ hơn và chốt hàng sớm.",
  male: "Các mẫu cổ phương này đang được nhiều khách đặt, hỗ trợ giao nhanh. Anh/chị bấm Zalo để mình giữ giá ưu đãi và gửi thêm review thực tế nhé.",
  daily: "Đây là các dòng bán chạy, đang có sẵn, hỗ trợ giao nhanh trong ngày. Anh/chị bấm Zalo để mình báo giá tốt theo số lượng nhé.",
  unknown: "Nếu chưa chốt được mẫu, anh/chị cứ nhắn Zalo, bên mình sẽ gợi ý thêm theo ngân sách và dịp sử dụng cụ thể.",
};

const CTA_TEXT: Record<IntentId, string> = {
  gift: "Nhắn Zalo để giữ bộ quà và được gói quà miễn phí",
  health: "Nhắn Zalo để được tư vấn dòng phù hợp và giữ giá ưu đãi",
  male: "Nhắn Zalo để tư vấn riêng và nhận giá tốt theo số lượng",
  daily: "Nhắn Zalo để chốt giá tốt và hỗ trợ giao nhanh trong hôm nay",
  unknown: "Nhắn Zalo để được tư vấn chi tiết và hỗ trợ giao nhanh",
};

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

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { query, purpose, budget, preference } = body as {
    query?: string;
    purpose?: string;
    budget?: string;
    preference?: string;
  };

  let intent: IntentId = "unknown";
  let budgetId: BudgetId = "unknown";
  let preferenceId: PreferenceId | null = null;

  if (query && typeof query === "string" && query.trim().length > 0) {
    intent = detectIntent(query);
    budgetId = detectBudget(query);
    preferenceId = detectPreference(query);
  }

  const fallbackIntent = normalizeIntent(purpose);
  if (intent === "unknown" && fallbackIntent) intent = fallbackIntent;

  const fallbackBudget = normalizeBudget(budget);
  if (budgetId === "unknown" && fallbackBudget) budgetId = fallbackBudget;

  if (!preferenceId) {
    const fallbackPref = normalizePreference(preference);
    if (fallbackPref) preferenceId = fallbackPref;
  }

  const [products, rules] = await Promise.all([
    getCachedProducts(),
    db.chatbotRule.findMany({ where: { isActive: true } }),
  ]);

  const { items, overriddenByRule } = matchProductsFromDb(products, rules, {
    query: query?.trim() || undefined,
    intent,
    budget: budgetId,
    preference: preferenceId,
  });

  const zaloPhone = process.env.ZALO_PHONE || "0000000000";
  const topNames = items.map((p) => p.name);
  const zaloText = items.length
    ? `Xin chào, mình muốn tư vấn: ${topNames.join(", ")}`
    : "Xin chào, mình cần tư vấn chọn rượu phù hợp";
  const zaloCTA = `https://zalo.me/${zaloPhone}?text=${encodeURIComponent(zaloText)}`;

  const matched = items.length > 0;
  const message = buildMessage(intent, budgetId, preferenceId, topNames);
  const followUp = FOLLOW_UP[intent] ?? FOLLOW_UP.unknown;
  const secondaryPush = SECONDARY_PUSH[intent] ?? SECONDARY_PUSH.unknown;
  const ctaText = CTA_TEXT[intent] ?? CTA_TEXT.unknown;

  return NextResponse.json({
    matched,
    intent,
    budget: budgetId,
    preference: preferenceId,
    overriddenByRule: overriddenByRule ? overriddenByRule.id : null,
    items,
    message,
    followUp,
    secondaryPush,
    ctaText,
    zaloCTA,
  });
}
