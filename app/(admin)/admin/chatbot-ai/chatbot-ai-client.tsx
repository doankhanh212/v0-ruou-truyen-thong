"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
  Copy,
  Trash2,
} from "lucide-react";

type Status = {
  configured: boolean;
  enabled: boolean;
  masked: string;
  fromEnv: boolean;
};

const STEPS = [
  {
    title: "Đăng ký OpenRouter",
    body: (
      <>
        Truy cập{" "}
        <a
          href="https://openrouter.ai/sign-in"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-600 underline hover:no-underline"
        >
          openrouter.ai/sign-in
          <ExternalLink size={11} className="ml-0.5 inline" />
        </a>{" "}
        — đăng nhập bằng Google hoặc GitHub. Hoàn toàn miễn phí, không cần thẻ tín dụng.
      </>
    ),
  },
  {
    title: "Vào trang quản lý API Keys",
    body: (
      <>
        Sau khi đăng nhập, mở{" "}
        <a
          href="https://openrouter.ai/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-600 underline hover:no-underline"
        >
          openrouter.ai/keys
          <ExternalLink size={11} className="ml-0.5 inline" />
        </a>{" "}
        rồi bấm nút <strong>Create Key</strong>.
      </>
    ),
  },
  {
    title: "Đặt tên & sao chép key",
    body: (
      <>
        Đặt tên gợi nhớ (vd: <em>ruou-truyen-thong</em>), bỏ trống ô credit limit, bấm <strong>Create</strong>.
        Một chuỗi dạng <code className="rounded bg-gray-100 px-1 text-xs">sk-or-v1-...</code> sẽ hiện ra.
        <strong className="text-amber-700"> Copy ngay</strong> — OpenRouter chỉ hiển thị 1 lần duy nhất.
      </>
    ),
  },
  {
    title: "Dán key vào ô bên dưới và lưu",
    body: (
      <>
        Hệ thống sẽ tự kiểm tra key trước khi lưu. Sau khi lưu thành công, chatbot AI sẽ tự kích hoạt trên
        website. Bạn có thể tắt/bật lại hoặc đổi key bất kỳ lúc nào.
      </>
    ),
  },
];

export function ChatbotAiClient() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/chatbot-ai");
      if (res.ok) {
        const data = (await res.json()) as Status;
        setStatus(data);
        setEnabled(data.enabled);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập API key" });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/chatbot-ai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim(), enabled }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Lưu thất bại" });
      } else {
        setMessage({ type: "success", text: data.message || "Đã lưu thành công" });
        setApiKey("");
        await loadStatus();
      }
    } catch {
      setMessage({ type: "error", text: "Không kết nối được tới server" });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (!apiKey.trim()) {
      setMessage({ type: "error", text: "Nhập API key trước khi test" });
      return;
    }
    setTesting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/chatbot-ai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim(), testOnly: true }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({ type: "success", text: "✓ Key hoạt động tốt — bấm Lưu để áp dụng" });
      } else {
        setMessage({ type: "error", text: data.error || "Key không hợp lệ" });
      }
    } catch {
      setMessage({ type: "error", text: "Không kết nối được tới server" });
    } finally {
      setTesting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Xoá API key đã lưu? Chatbot AI sẽ ngừng hoạt động trên website.")) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/chatbot-ai", { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "Đã xoá API key" });
        await loadStatus();
      } else {
        setMessage({ type: "error", text: "Không xoá được" });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleEnabled(newEnabled: boolean) {
    if (!status?.configured) return;
    // Lưu trạng thái enable mới với key trống → API yêu cầu key, nên gửi placeholder để chỉ đổi enabled không hợp lý
    // → đơn giản hơn: chỉ cho phép toggle khi đã có key, dùng nguyên key cũ
    setEnabled(newEnabled);
    // Optimistic: gọi PATCH/PUT khác — ở đây mình giữ trạng thái local + đẩy lên cùng lúc với lưu key
    // Vì luồng đơn giản: toggle này chỉ là UI, sẽ áp dụng khi user nhập key mới + Lưu
    // Để toggle ngay không cần re-key, ta cần endpoint riêng. Giữ flow đơn giản: cho admin biết phải Lưu lại.
    setMessage({
      type: "success",
      text: newEnabled
        ? "Đã bật — bấm Lưu sau khi nhập key để áp dụng"
        : "Đã tắt — bấm Lưu sau khi nhập key để áp dụng",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Sparkles size={22} className="text-amber-500" /> Chatbot AI
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Trợ lý AI tư vấn sản phẩm tự động trên website, dùng OpenRouter (miễn phí, hoạt động cho Việt Nam).
          </p>
        </div>
      </div>

      {/* Status card */}
      <div
        className={`rounded-lg border p-4 ${
          status?.configured
            ? status.enabled
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={14} className="animate-spin" /> Đang kiểm tra trạng thái...
          </p>
        ) : status?.configured ? (
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className={status.enabled ? "text-green-600" : "text-amber-600"} />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${status.enabled ? "text-green-800" : "text-amber-800"}`}>
                {status.enabled ? "Chatbot AI đang hoạt động" : "Chatbot AI đã được cấu hình nhưng đang tắt"}
              </p>
              <p className="mt-0.5 text-xs text-gray-600">
                Key hiện tại: <code className="rounded bg-white px-1.5 py-0.5">{status.masked}</code>
                {status.fromEnv && (
                  <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-[11px] text-blue-700">
                    đến từ biến môi trường .env
                  </span>
                )}
              </p>
            </div>
            {!status.fromEnv && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-1 rounded border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={12} /> Xoá key
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-gray-400" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Chatbot AI chưa được cấu hình</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Widget AI sẽ tự động ẩn trên website cho đến khi bạn nhập API key bên dưới.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* How-to */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-5">
        <h2 className="mb-3 text-sm font-bold text-blue-900">📘 Hướng dẫn lấy API key OpenRouter (3 phút)</h2>
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="flex-1 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">{s.title}</p>
                <p className="mt-0.5 leading-relaxed">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          💡 <strong>Free tier:</strong> ~50 request/ngày với model Gemini 2.0 Flash miễn phí. Hết quota thì
          widget tạm ngừng, không tốn tiền. Có thể nạp credit tối thiểu $1 ở openrouter.ai/credits để mở
          giới hạn ~1000 req/ngày.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4 rounded-lg border bg-white p-5">
        <h2 className="text-sm font-bold text-gray-900">Nhập API key</h2>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">
            OpenRouter API Key <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded border border-gray-300 px-3 py-2 pr-9 text-sm font-mono focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/30"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title={showKey ? "Ẩn" : "Hiện"}
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigator.clipboard.readText().then(setApiKey).catch(() => {})}
              className="flex items-center gap-1 rounded border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              title="Dán từ clipboard"
            >
              <Copy size={12} /> Dán
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Key sẽ được mã hoá tại transit (HTTPS) và chỉ admin đăng nhập mới đọc được.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleToggleEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="font-medium text-gray-700">Bật chatbot AI trên website</span>
          <span className="text-xs text-gray-500">(tắt = ẩn widget khỏi frontend)</span>
        </label>

        {message && (
          <div
            className={`rounded-md px-3 py-2 text-sm ${
              message.type === "success"
                ? "border border-green-200 bg-green-50 text-green-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving || testing || !apiKey.trim()}
            className="flex items-center gap-2 rounded bg-[#8B1A1A] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {saving ? "Đang lưu..." : "Test & Lưu"}
          </button>
          <button
            type="button"
            onClick={handleTest}
            disabled={saving || testing || !apiKey.trim()}
            className="flex items-center gap-2 rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {testing ? "Đang test..." : "Chỉ test"}
          </button>
        </div>
      </form>

      {/* Notes */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
        <p className="mb-1 font-semibold text-gray-700">Lưu ý bảo mật:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>API key chỉ được dùng phía server — không bao giờ gửi xuống trình duyệt khách.</li>
          <li>Khi xoá key, chatbot AI tự động ẩn trên website ngay lập tức (cache hết hạn sau 30 giây).</li>
          <li>
            Hệ thống tự rate-limit 30 yêu cầu/phút trên mỗi IP để tránh ai đó dùng API key của bạn để chạy
            lậu.
          </li>
          <li>
            Nếu bạn đặt key trong file <code>.env</code> server, hệ thống sẽ ưu tiên key trong DB (nhập tại
            đây) — tiện cho việc đổi key nhanh mà không cần restart server.
          </li>
        </ul>
      </div>
    </div>
  );
}
