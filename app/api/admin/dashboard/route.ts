import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [productCount, ruleCount, categoryCount, postCount, trackingCount, zaloClicks] =
    await Promise.all([
      db.product.count().catch(() => 0),
      db.chatbotRule.count().catch(() => 0),
      db.category.count().catch(() => 0),
      db.post.count().catch(() => 0),
      db.trackingLog.count().catch(() => 0),
      db.trackingLog.count({ where: { event: "click_zalo" } }).catch(() => 0),
    ]);

  return NextResponse.json({
    cards: [
      { label: "Sản phẩm", value: productCount },
      { label: "Danh mục", value: categoryCount },
      { label: "Bài viết", value: postCount },
      { label: "Chatbot rules", value: ruleCount },
      { label: "Tracking logs", value: trackingCount },
      { label: "Click Zalo", value: zaloClicks },
    ],
    updatedAt: new Date().toISOString(),
  });
}
