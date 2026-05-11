import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { adminRateGuard } from "@/lib/admin-rate-limit";
import {
  callOpenRouter,
  deleteChatbotAiKey,
  getChatbotAiConfig,
  maskApiKey,
  saveChatbotAiKey,
} from "@/lib/chatbot-ai-config";
import { db } from "@/lib/db";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const PutSchema = z.object({
  apiKey: z.string().trim().min(0).max(500),
  enabled: z.boolean().optional(),
  testOnly: z.boolean().optional(),
});

async function pingApiKey(apiKey: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const reply = await callOpenRouter({
      apiKey,
      message: "Trả lời cực ngắn: Hi",
      maxTokens: 30,
      temperature: 0,
    });
    if (!reply) {
      return { ok: false, error: "API trả về rỗng. Thử lại sau ít phút." };
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[chatbot-ai/ping] Raw error:", msg);

    if (msg.includes("401")) {
      return { ok: false, error: "API key không hợp lệ. Kiểm tra lại key vừa copy từ openrouter.ai/keys" };
    }
    if (msg.includes("402")) {
      return { ok: false, error: "Tài khoản OpenRouter của bạn không có credits. Vào openrouter.ai/credits để nạp (hoặc dùng model :free)." };
    }
    if (msg.includes("403")) {
      return { ok: false, error: "Bị từ chối quyền — kiểm tra key có bị disable trên openrouter.ai/keys không." };
    }
    if (msg.includes("429")) {
      return { ok: false, error: "Đã vượt giới hạn request/phút. Đợi 1 phút rồi thử lại." };
    }
    return { ok: false, error: `Lỗi: ${msg.slice(0, 400)}` };
  }
}

async function dbHasKey(): Promise<boolean> {
  try {
    const rows = await db.setting.findMany({
      where: { key: { in: ["chatbot_api_key", "gemini_api_key"] } },
    });
    return rows.some((r) => Boolean(r.value));
  } catch {
    return false;
  }
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const config = await getChatbotAiConfig();
  const hasDb = await dbHasKey();
  return NextResponse.json({
    configured: config.configured,
    enabled: config.enabled,
    masked: maskApiKey(config.apiKey),
    fromEnv: config.configured && !hasDb,
  });
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const limited = await adminRateGuard(request);
  if (limited) return limited;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const parsed = PutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }

  const { apiKey, enabled = true, testOnly = false } = parsed.data;

  if (testOnly) {
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "Chưa nhập API key" }, { status: 400 });
    }
    const result = await pingApiKey(apiKey);
    return NextResponse.json(result);
  }

  if (apiKey) {
    const result = await pingApiKey(apiKey);
    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Key không hợp lệ" }, { status: 400 });
    }
    await saveChatbotAiKey(apiKey, enabled);
    return NextResponse.json({ ok: true, message: "Đã lưu và xác thực API key thành công" });
  }

  return NextResponse.json({ error: "Vui lòng nhập API key" }, { status: 400 });
}

export async function DELETE() {
  const authError = await requireAuth();
  if (authError) return authError;

  await deleteChatbotAiKey();
  return NextResponse.json({ ok: true });
}
