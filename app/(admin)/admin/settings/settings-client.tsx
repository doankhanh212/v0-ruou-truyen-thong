"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Lock, RotateCcw, Save, Settings2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { SettingsMap } from "@/lib/settings";

type SystemConfig = {
  gtmId: string;
  facebookPixelId: string;
  defaultOgImage: string;
  orderNotifyEmail: string;
  freeShippingThreshold: number;
  agePopupEnabled: boolean;
  floatingZaloUrl: string;
  floatingMessengerUrl: string;
  floatingWhatsappUrl: string;
};

const DEFAULT_SYSTEM: SystemConfig = {
  gtmId: "",
  facebookPixelId: "",
  defaultOgImage: "",
  orderNotifyEmail: "",
  freeShippingThreshold: 0,
  agePopupEnabled: true,
  floatingZaloUrl: "",
  floatingMessengerUrl: "",
  floatingWhatsappUrl: "",
};

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

function parseObject(raw: string | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function parseSystem(settings: SettingsMap): SystemConfig {
  const parsed = parseObject(settings.system_config);
  const freeShippingThreshold = Number(parsed.freeShippingThreshold ?? 0);
  return {
    gtmId: typeof parsed.gtmId === "string" ? parsed.gtmId : settings.gtm_id,
    facebookPixelId: typeof parsed.facebookPixelId === "string" ? parsed.facebookPixelId : "",
    defaultOgImage: typeof parsed.defaultOgImage === "string" ? parsed.defaultOgImage : "",
    orderNotifyEmail:
      typeof parsed.orderNotifyEmail === "string" ? parsed.orderNotifyEmail : settings.email,
    freeShippingThreshold: Number.isFinite(freeShippingThreshold) ? freeShippingThreshold : 0,
    agePopupEnabled:
      typeof parsed.agePopupEnabled === "boolean"
        ? parsed.agePopupEnabled
        : DEFAULT_SYSTEM.agePopupEnabled,
    floatingZaloUrl:
      typeof parsed.floatingZaloUrl === "string" ? parsed.floatingZaloUrl : settings.zalo_url,
    floatingMessengerUrl:
      typeof parsed.floatingMessengerUrl === "string" ? parsed.floatingMessengerUrl : "",
    floatingWhatsappUrl:
      typeof parsed.floatingWhatsappUrl === "string" ? parsed.floatingWhatsappUrl : "",
  };
}

function MessageBox({ message }: { message: { kind: "ok" | "err"; text: string } | null }) {
  if (!message) return null;
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${
        message.kind === "ok"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {message.text}
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  helper,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
      {helper ? <span className="mt-1 block text-xs text-slate-400">{helper}</span> : null}
    </label>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ kind: "err", text: "Mật khẩu xác nhận không khớp" });
      return;
    }
    if (newPassword.length < 10) {
      setMessage({ kind: "err", text: "Mật khẩu mới phải có ít nhất 10 ký tự" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ kind: "err", text: data.error || "Đổi mật khẩu thất bại" });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage({ kind: "ok", text: "Đã đổi mật khẩu. Vui lòng đăng nhập lại." });
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 1500);
    } catch {
      setMessage({ kind: "err", text: "Không kết nối được tới server" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-3 text-base font-bold text-slate-800">
        <Lock size={16} className="text-sky-500" />
        Bảo mật
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextInput label="Mật khẩu hiện tại" type="password" value={currentPassword} onChange={setCurrentPassword} />
          <TextInput label="Mật khẩu mới" type="password" value={newPassword} onChange={setNewPassword} helper="Tối thiểu 10 ký tự." />
          <TextInput label="Xác nhận mật khẩu mới" type="password" value={confirmPassword} onChange={setConfirmPassword} />
        </div>
        <MessageBox message={message} />
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
        >
          {submitting ? "Đang đổi..." : "Đổi mật khẩu"}
        </button>
      </form>
    </section>
  );
}

export function SettingsClient({ initial }: { initial: SettingsMap }) {
  const [settings, setSettings] = useState<SettingsMap>(initial);
  const [system, setSystem] = useState<SystemConfig>(() => parseSystem(initial));
  const [savedSystem, setSavedSystem] = useState<SystemConfig>(() => parseSystem(initial));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    const cleanSystem: SystemConfig = {
      ...system,
      gtmId: system.gtmId.trim(),
      facebookPixelId: system.facebookPixelId.trim(),
      defaultOgImage: system.defaultOgImage.trim(),
      orderNotifyEmail: system.orderNotifyEmail.trim(),
      freeShippingThreshold: Math.max(0, Math.round(Number(system.freeShippingThreshold) || 0)),
      floatingZaloUrl: system.floatingZaloUrl.trim(),
      floatingMessengerUrl: system.floatingMessengerUrl.trim(),
      floatingWhatsappUrl: system.floatingWhatsappUrl.trim(),
    };

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          system_config: JSON.stringify(cleanSystem),
          gtm_id: cleanSystem.gtmId,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Lưu thất bại");
      }

      const updated = (await res.json()) as SettingsMap;
      const parsed = parseSystem(updated);
      setSettings(updated);
      setSystem(parsed);
      setSavedSystem(parsed);
      setMessage({ kind: "ok", text: "Đã lưu cài đặt hệ thống" });
    } catch (error) {
      setMessage({ kind: "err", text: error instanceof Error ? error.message : "Không kết nối được tới server" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cài đặt hệ thống</h1>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý tracking, SEO mặc định, e-commerce và popup xác nhận độ tuổi.
        </p>
      </div>

      <MessageBox message={message} />

      <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-3 text-base font-bold text-slate-800">
          <Settings2 size={16} className="text-sky-500" />
          Tracking & E-commerce
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextInput
            label="Google Tag Manager ID"
            value={system.gtmId}
            onChange={(value) => setSystem((current) => ({ ...current, gtmId: value }))}
            placeholder="GTM-XXXXXXX"
          />
          <TextInput
            label="Facebook Pixel ID"
            value={system.facebookPixelId}
            onChange={(value) => setSystem((current) => ({ ...current, facebookPixelId: value }))}
            placeholder="1234567890"
          />
          <TextInput
            label="Default OG Image"
            value={system.defaultOgImage}
            onChange={(value) => setSystem((current) => ({ ...current, defaultOgImage: value }))}
            placeholder="/uploads/og.jpg"
            helper="Ảnh dùng khi SEO page chưa có OG image riêng."
          />
          <TextInput
            label="Email nhận thông báo đơn hàng"
            value={system.orderNotifyEmail}
            onChange={(value) => setSystem((current) => ({ ...current, orderNotifyEmail: value }))}
            placeholder="orders@example.com"
          />
          <TextInput
            label="Mức giá Freeship"
            type="number"
            value={system.freeShippingThreshold}
            onChange={(value) => setSystem((current) => ({ ...current, freeShippingThreshold: Number(value) }))}
            placeholder="1000000"
          />
          <TextInput
            label="Link Zalo nổi"
            value={system.floatingZaloUrl}
            onChange={(value) => setSystem((current) => ({ ...current, floatingZaloUrl: value }))}
            placeholder="https://zalo.me/84902931119"
            helper="Bỏ trống nếu không muốn hiển thị nút Zalo nổi."
          />
          <TextInput
            label="Link Messenger nổi"
            value={system.floatingMessengerUrl}
            onChange={(value) => setSystem((current) => ({ ...current, floatingMessengerUrl: value }))}
            placeholder="https://m.me/ten-fanpage"
            helper="Bỏ trống nếu không muốn hiển thị nút Messenger."
          />
          <TextInput
            label="Link WhatsApp nổi"
            value={system.floatingWhatsappUrl}
            onChange={(value) => setSystem((current) => ({ ...current, floatingWhatsappUrl: value }))}
            placeholder="https://wa.me/84902931119"
            helper="Bỏ trống nếu không muốn hiển thị nút WhatsApp."
          />
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Popup xác nhận độ tuổi 18+</p>
                <p className="mt-1 text-xs text-slate-500">
                  Bật để yêu cầu khách xác nhận trước khi xem website.
                </p>
              </div>
              <Switch
                checked={system.agePopupEnabled}
                onCheckedChange={(checked) => setSystem((current) => ({ ...current, agePopupEnabled: checked }))}
                aria-label="Bật tắt popup xác nhận độ tuổi"
                className="h-6 w-11"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? "Đang lưu..." : "Lưu cài đặt"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              setSystem(savedSystem);
              setMessage(null);
            }}
            className="inline-flex items-center gap-2 rounded bg-slate-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600 disabled:opacity-50"
          >
            <RotateCcw size={15} />
            Làm lại
          </button>
        </div>
      </form>

      <PasswordSection />
    </div>
  );
}
