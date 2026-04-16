import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { matchRule } from "@/lib/chatbot";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { purpose, budget, preference } = body;

  if (!purpose) {
    return NextResponse.json({ error: "Missing purpose" }, { status: 400 });
  }

  const rules = await db.chatbotRule.findMany({
    where: { isActive: true },
  });

  const matchedRule = matchRule({ purpose, budget, preference }, rules);

  let products: Awaited<ReturnType<typeof db.product.findMany>>;
  
  if (matchedRule && matchedRule.recommendedProducts.length > 0) {
    products = await db.product.findMany({
      where: { id: { in: matchedRule.recommendedProducts }, inStock: true },
    });
  } else {
    products = await db.product.findMany({
      where: { featured: true, inStock: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
    });
  }

  const matched = !!matchedRule;
  const zaloPhone = process.env.ZALO_PHONE || "0000000000";
  const productNames = products.map((p: { name: string }) => p.name).join(", ");
  const budgetText = budget ? `, ngân sách khoảng ${Number(budget).toLocaleString("vi-VN")}đ` : "";
  const zaloCTA = `https://zalo.me/${zaloPhone}?text=${encodeURIComponent(
    `Chào shop! Mình muốn hỏi về: ${productNames}. Mục đích: ${purpose}${budgetText}.`
  )}`;

  return NextResponse.json({
    matched,
    products,
    zaloCTA,
    fallback: !matched ? "Để được tư vấn chính xác hơn, bạn nhắn Zalo cho mình nhé!" : null,
  });
}
