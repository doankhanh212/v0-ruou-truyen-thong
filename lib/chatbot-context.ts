import { db } from "./db";
import redis from "./redis";

/**
 * Build a knowledge context string for the AI chatbot from DB content.
 *
 * The context is concise (~3-5KB) so we don't blow Gemini's token budget,
 * and cached in Redis for 5 minutes — admin updates show up within that window.
 *
 * Returns a plain string (not JSON) because Gemini reasons better over prose
 * than serialized objects in our experience.
 */

const CACHE_KEY = "chatbot:context:v1";
const TTL_SECONDS = 300; // 5 minutes
// Giảm số entries để rút context xuống ~1.5KB → AI xử lý nhanh hơn rất nhiều
// (mỗi 1KB context ≈ +1-2s response time với model free).
const MAX_PRODUCTS = 15;
const MAX_POSTS = 4;
const MAX_RULES = 10;

function stripHtml(html: string, maxLen: number): string {
  const text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
}

function formatPrice(p: number): string {
  return p.toLocaleString("vi-VN") + "đ";
}

async function buildFreshContext(): Promise<string> {
  const [products, posts, gioiThieu, lienHe, rules] = await Promise.all([
    db.product.findMany({
      where: { inStock: true, isDeleted: false },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      take: MAX_PRODUCTS,
      select: {
        name: true,
        slug: true,
        price: true,
        description: true,
        featured: true,
        categoryRel: { select: { name: true, slug: true } },
      },
    }),
    db.post.findMany({
      where: { isPublished: true, isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: MAX_POSTS,
      select: { title: true, slug: true, content: true },
    }),
    db.page.findFirst({
      where: { slug: "gioi-thieu", isActive: true, isPublished: true },
      select: { content: true },
    }),
    db.page.findFirst({
      where: { slug: "lien-he", isActive: true, isPublished: true },
      select: { content: true },
    }),
    db.chatbotRule.findMany({
      where: { isActive: true },
      orderBy: { priority: "desc" },
      take: MAX_RULES,
      select: {
        purpose: true,
        preference: true,
        budgetMin: true,
        budgetMax: true,
        recommendedProducts: true,
        note: true,
      },
    }),
  ]);

  // Compact format: tên, giá, link — bỏ description dài để giảm token
  const productLines = products.map((p) => {
    const cat = p.categoryRel?.name ? ` [${p.categoryRel.name}]` : "";
    const featured = p.featured ? " ⭐" : "";
    return `• ${p.name}${cat}${featured} — ${formatPrice(p.price)} (/san-pham/${p.slug})`;
  });

  const postLines = posts.map((p) => `• "${p.title}" (/tin-tuc/${p.slug})`);

  const sections: string[] = [];

  sections.push(
    "BẠN LÀ TRỢ LÝ AI CỦA WEBSITE CỬU LONG MỸ TỬU — chuyên về rượu truyền thống Việt Nam.",
    "Trả lời thân thiện, ngắn gọn, có dùng emoji vừa phải. Khi gợi ý sản phẩm, dùng đúng tên và đính kèm link dạng /san-pham/<slug>. Nếu khách hỏi giá, trả về số tiền theo VND. Nếu không có thông tin, đề nghị khách Chat Zalo để được tư vấn.",
    ""
  );

  if (productLines.length > 0) {
    sections.push("## SẢN PHẨM ĐANG BÁN");
    sections.push(...productLines);
    sections.push("");
  }

  if (postLines.length > 0) {
    sections.push("## TIN TỨC / BÀI VIẾT");
    sections.push(...postLines);
    sections.push("");
  }

  if (gioiThieu?.content) {
    sections.push("## GIỚI THIỆU CÔNG TY");
    sections.push(stripHtml(gioiThieu.content, 600));
    sections.push("");
  }

  if (lienHe?.content) {
    sections.push("## THÔNG TIN LIÊN HỆ");
    sections.push(stripHtml(lienHe.content, 400));
    sections.push("");
  }

  if (rules.length > 0) {
    sections.push("## GỢI Ý TƯ VẤN (DO ADMIN CẤU HÌNH — ƯU TIÊN ÁP DỤNG KHI KHỚP)");
    for (const r of rules) {
      const cond: string[] = [];
      if (r.purpose !== "any") cond.push(`mục đích: ${r.purpose}`);
      if (r.preference && r.preference !== "any") cond.push(`khẩu vị: ${r.preference}`);
      if (r.budgetMin) cond.push(`từ ${formatPrice(r.budgetMin)}`);
      if (r.budgetMax) cond.push(`đến ${formatPrice(r.budgetMax)}`);
      const condStr = cond.length > 0 ? cond.join(", ") : "mọi trường hợp";
      const note = r.note ? ` — Ghi chú: ${r.note}` : "";
      sections.push(`• Khi (${condStr}) → gợi ý ${r.recommendedProducts.length} sản phẩm${note}`);
    }
    sections.push("");
  }

  sections.push(
    "Lưu ý: KHÔNG bịa sản phẩm hay link. Nếu khách hỏi điều ngoài phạm vi (vd: thời tiết, chính trị, code), từ chối nhẹ nhàng và quay lại chủ đề rượu."
  );

  return sections.join("\n");
}

export async function getChatbotContext(): Promise<string> {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) return cached;
  } catch (err) {
    console.error(JSON.stringify({ module: "ChatbotContext", op: "get", error: String(err) }));
  }

  const fresh = await buildFreshContext();

  try {
    await redis.setex(CACHE_KEY, TTL_SECONDS, fresh);
  } catch (err) {
    console.error(JSON.stringify({ module: "ChatbotContext", op: "set", error: String(err) }));
  }

  return fresh;
}

export async function invalidateChatbotContext(): Promise<void> {
  try {
    await redis.del(CACHE_KEY);
  } catch (err) {
    console.error(JSON.stringify({ module: "ChatbotContext", op: "invalidate", error: String(err) }));
  }
}
