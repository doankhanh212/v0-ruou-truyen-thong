import { db } from "./db";
import redis from "./redis";

// Đổi tên Setting key: ưu tiên đọc key mới, fallback key cũ để tương thích DB
const SETTING_KEY = "chatbot_api_key";
const LEGACY_SETTING_KEY = "gemini_api_key";
const ENABLED_KEY = "chatbot_ai_enabled";
const CACHE_KEY = "chatbot:ai-config:v2";
const TTL_SECONDS = 30;

/**
 * Models dùng trên OpenRouter — free tier.
 * Thứ tự đã tối ưu: model nhỏ/nhanh trước, model lớn là fallback khi cần chất lượng cao.
 * Đo qua benchmark OpenRouter: latency p50 (giây) cho ~200 token output.
 *   - nemotron-nano-9b:    ~2-3s    (NVIDIA, 9B — siêu nhanh)
 *   - gemma-4-26b:         ~3-4s    (Google, 26B MoE active 4B)
 *   - llama-3.2-3b:        ~2s      (Meta, 3B — backup nhanh nếu provider chính chậm)
 *   - llama-3.3-70b:       ~5-7s    (chất lượng cao, dự phòng)
 *   - gpt-oss-20b:         ~4-5s    (OpenAI open-weight, dự phòng cuối)
 */
export const OPENROUTER_MODELS = [
  "nvidia/nemotron-nano-9b-v2:free",
  "google/gemma-4-26b-a4b-it:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "openai/gpt-oss-20b:free",
] as const;

export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export type ChatbotAiConfig = {
  apiKey: string;
  enabled: boolean;
  configured: boolean;
};

export async function getChatbotAiConfig(): Promise<ChatbotAiConfig> {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) return JSON.parse(cached) as ChatbotAiConfig;
  } catch {
    // ignore
  }

  let dbKey = "";
  let dbEnabled = true;
  try {
    const rows = await db.setting.findMany({
      where: { key: { in: [SETTING_KEY, LEGACY_SETTING_KEY, ENABLED_KEY] } },
    });
    let modernKey = "";
    let legacyKey = "";
    for (const r of rows) {
      if (r.key === SETTING_KEY) modernKey = r.value || "";
      if (r.key === LEGACY_SETTING_KEY) legacyKey = r.value || "";
      if (r.key === ENABLED_KEY) dbEnabled = r.value === "true";
    }
    dbKey = modernKey || legacyKey;
  } catch {
    // ignore
  }

  // Env fallback: hỗ trợ cả OPENROUTER_API_KEY và GEMINI_API_KEY (cũ)
  const apiKey = dbKey || process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || "";

  const config: ChatbotAiConfig = {
    apiKey,
    enabled: dbEnabled,
    configured: Boolean(apiKey),
  };

  try {
    await redis.setex(CACHE_KEY, TTL_SECONDS, JSON.stringify(config));
  } catch {
    // ignore
  }

  return config;
}

export async function saveChatbotAiKey(apiKey: string, enabled: boolean): Promise<void> {
  await db.$transaction([
    db.setting.upsert({
      where: { key: SETTING_KEY },
      create: { key: SETTING_KEY, value: apiKey },
      update: { value: apiKey },
    }),
    db.setting.upsert({
      where: { key: ENABLED_KEY },
      create: { key: ENABLED_KEY, value: enabled ? "true" : "false" },
      update: { value: enabled ? "true" : "false" },
    }),
    // Xoá key cũ để tránh lẫn lộn
    db.setting.deleteMany({ where: { key: LEGACY_SETTING_KEY } }),
  ]);
  try {
    await redis.del(CACHE_KEY);
  } catch {
    // ignore
  }
}

export async function deleteChatbotAiKey(): Promise<void> {
  try {
    await db.setting.deleteMany({ where: { key: { in: [SETTING_KEY, LEGACY_SETTING_KEY] } } });
  } catch {
    // ignore
  }
  try {
    await redis.del(CACHE_KEY);
  } catch {
    // ignore
  }
}

export function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 12) return "••••••••";
  return `${key.slice(0, 7)}${"•".repeat(Math.max(8, key.length - 11))}${key.slice(-4)}`;
}

type CommonOpts = {
  apiKey: string;
  systemPrompt?: string;
  history?: Array<{ role: "user" | "model"; text: string }>;
  message: string;
  maxTokens?: number;
  temperature?: number;
  siteUrl?: string;
};

function buildMessages(opts: CommonOpts) {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
  if (opts.systemPrompt) messages.push({ role: "system", content: opts.systemPrompt });
  for (const m of opts.history || []) {
    messages.push({ role: m.role === "model" ? "assistant" : "user", content: m.text });
  }
  messages.push({ role: "user", content: opts.message });
  return messages;
}

function buildHeaders(opts: CommonOpts): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${opts.apiKey}`,
  };
  if (opts.siteUrl) headers["HTTP-Referer"] = opts.siteUrl;
  headers["X-Title"] = "Ruou Truyen Thong";
  return headers;
}

function isFatalStatus(status: number) {
  // 401: invalid key, 402: hết credit, 403: forbidden — fail luôn không thử model khác
  return status === 401 || status === 402 || status === 403;
}

/**
 * Gọi OpenRouter (non-streaming). Dùng cho admin ping test.
 * Fallback qua các model trong OPENROUTER_MODELS nếu provider lỗi 429/5xx.
 */
export async function callOpenRouter(opts: CommonOpts): Promise<string> {
  const messages = buildMessages(opts);
  const headers = buildHeaders(opts);
  let lastError: Error | null = null;

  for (const model of OPENROUTER_MODELS) {
    const res = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages,
        max_tokens: opts.maxTokens ?? 400,
        temperature: opts.temperature ?? 0.7,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (typeof reply === "string" && reply.trim()) return reply.trim();
      lastError = new Error(`Model ${model} trả về rỗng`);
      continue;
    }

    const errText = await res.text();
    if (isFatalStatus(res.status)) {
      const err = new Error(`OpenRouter ${res.status}: ${errText.slice(0, 500)}`) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    lastError = new Error(`OpenRouter ${res.status} (model ${model}): ${errText.slice(0, 300)}`);
  }

  if (lastError) throw lastError;
  throw new Error("Tất cả model đều không phản hồi");
}

/**
 * Stream OpenRouter chat completion qua Server-Sent Events.
 * Trả về ReadableStream<string> — mỗi chunk là 1 đoạn text (delta) đã decode sẵn.
 * Fallback qua các model nếu model đầu bị 429/upstream lỗi (đảm bảo "first byte" càng nhanh càng tốt).
 */
export async function streamOpenRouter(opts: CommonOpts): Promise<ReadableStream<string>> {
  const messages = buildMessages(opts);
  const headers = buildHeaders(opts);

  // Try từng model cho tới khi 1 cái mở stream OK
  let upstream: Response | null = null;
  let lastError: Error | null = null;

  for (const model of OPENROUTER_MODELS) {
    const res = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages,
        max_tokens: opts.maxTokens ?? 400,
        temperature: opts.temperature ?? 0.7,
        stream: true,
      }),
    });

    if (res.ok && res.body) {
      upstream = res;
      break;
    }

    const errText = res.body ? await res.text() : "";
    if (isFatalStatus(res.status)) {
      const err = new Error(`OpenRouter ${res.status}: ${errText.slice(0, 500)}`) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    lastError = new Error(`OpenRouter ${res.status} (model ${model}): ${errText.slice(0, 300)}`);
  }

  if (!upstream || !upstream.body) {
    throw lastError ?? new Error("Tất cả model đều không stream được");
  }

  // Convert raw SSE bytes → string deltas
  return new ReadableStream<string>({
    async start(controller) {
      const reader = upstream!.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // OpenRouter SSE format: lines `data: {...}\n\n`
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            // OpenRouter có comment lines như `: OPENROUTER PROCESSING` — bỏ qua
            if (trimmed.startsWith(":")) continue;
            if (!trimmed.startsWith("data: ")) continue;

            const payload = trimmed.slice(6);
            if (payload === "[DONE]") {
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(payload);
              const delta = parsed?.choices?.[0]?.delta?.content;
              if (typeof delta === "string" && delta) {
                controller.enqueue(delta);
              }
            } catch {
              // ignore malformed line
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      } finally {
        reader.releaseLock();
      }
    },
  });
}
