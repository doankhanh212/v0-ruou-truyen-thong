import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { getChatbotContext } from "@/lib/chatbot-context";
import { getChatbotAiConfig, streamOpenRouter } from "@/lib/chatbot-ai-config";

const RATE_LIMIT = { limit: 30, windowSeconds: 60 };
const MAX_HISTORY_TURNS = 12;

const MessageSchema = z.object({
  role: z.enum(["user", "model"]),
  text: z.string().min(1).max(2000),
});

const RequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  history: z.array(MessageSchema).max(MAX_HISTORY_TURNS).optional(),
});

function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(request: NextRequest) {
  const config = await getChatbotAiConfig();
  if (!config.configured || !config.enabled) {
    return NextResponse.json(
      { error: "Chatbot AI hiện không khả dụng." },
      { status: 503 }
    );
  }

  const ip = clientIp(request.headers);
  const rl = await rateLimit(`chatbot-ai:${ip}`, RATE_LIMIT.limit, RATE_LIMIT.windowSeconds);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Bạn nhắn hơi nhanh — vui lòng đợi một chút rồi thử lại." },
      {
        status: 429,
        headers: {
          "Retry-After": String(RATE_LIMIT.windowSeconds),
          "X-RateLimit-Limit": String(rl.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  let parsed;
  try {
    const raw = await request.json();
    parsed = RequestSchema.safeParse(raw);
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
  if (!parsed?.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const { message, history = [] } = parsed.data;

  let context: string;
  try {
    context = await getChatbotContext();
  } catch (err) {
    console.error("[chatbot/ai] context build failed:", err);
    return NextResponse.json(
      { error: "Không thể tải dữ liệu kiến thức. Thử lại sau." },
      { status: 500 }
    );
  }

  let upstream: ReadableStream<string>;
  try {
    upstream = await streamOpenRouter({
      apiKey: config.apiKey,
      systemPrompt: context,
      history,
      message,
      maxTokens: 400,
      temperature: 0.7,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[chatbot/ai] OpenRouter error:", msg);
    return NextResponse.json(
      { error: "Hệ thống AI tạm thời gặp sự cố. Vui lòng thử lại hoặc Chat Zalo." },
      { status: 502 }
    );
  }

  // Re-encode về byte stream cho HTTP response.
  // Frontend đọc bằng response.body.getReader() + TextDecoder — không cần SSE format,
  // chỉ là plain UTF-8 text concatenation. Đơn giản và nhanh nhất.
  const encoder = new TextEncoder();
  const passthrough = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) controller.enqueue(encoder.encode(value));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      } finally {
        reader.releaseLock();
      }
    },
  });

  return new Response(passthrough, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-RateLimit-Limit": String(rl.limit),
      "X-RateLimit-Remaining": String(rl.remaining),
      // Disable Next.js / proxy buffering — quan trọng để token đến browser theo real-time
      "X-Accel-Buffering": "no",
    },
  });
}
