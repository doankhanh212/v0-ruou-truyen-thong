import { NextResponse } from "next/server";
import { getChatbotAiConfig } from "@/lib/chatbot-ai-config";

/**
 * Public endpoint — frontend widget gọi để biết có nên hiện chính nó hay không.
 * Chỉ trả flag boolean, KHÔNG bao giờ trả API key.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getChatbotAiConfig();
    return NextResponse.json(
      {
        available: config.configured && config.enabled,
      },
      {
        headers: {
          // Không cache ở browser — admin bật/tắt phải có hiệu lực ngay sau reload trang.
          // Server-side đã có Redis cache 30s ở getChatbotAiConfig() nên không tốn DB.
          "Cache-Control": "no-store, must-revalidate",
        },
      }
    );
  } catch {
    return NextResponse.json({ available: false });
  }
}
