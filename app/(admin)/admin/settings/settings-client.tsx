"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Lock, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { Switch } from "@/components/ui/switch";
import type { SettingsMap } from "@/lib/settings";

type FooterLink = { label: string; href: string };

type FooterConfig = {
  shopInfoHtml: string;
  newsLinks: FooterLink[];
  policyLinks: FooterLink[];
  fanpageIframe: string;
  copyright: string;
};

type SystemConfig = {
  gtmId: string;
  facebookPixelId: string;
  defaultOgImage: string;
  orderNotifyEmail: string;
  freeShippingThreshold: number;
  agePopupEnabled: boolean;
};

const DEFAULT_FOOTER: FooterConfig = {
  shopInfoHtml:
    "<p><strong>Rượu Truyền Thống</strong></p><p>Rượu truyền thống cao cấp, chưng cất từ dược liệu Việt Nam theo phương pháp truyền thống.</p>",
  newsLinks: [
    { label: "Tin tức", href: "/news" },
    { label: "Sản phẩm", href: "/san-pham" },
  ],
  policyLinks: [
    { label: "Chính sách bảo mật", href: "/lien-he" },
    { label: "Điều khoản dịch vụ", href: "/lien-he" },
  ],
  fanpageIframe: "",
  copyright: "Rượu Truyền Thống. Tất cả các quyền được bảo lưu.",
};

const DEFAULT_SYSTEM: SystemConfig = {
  gtmId: "",
  facebookPixelId: "",
  defaultOgImage: "",
  orderNotifyEmail: "",
  freeShippingThreshold: 0,
  agePopupEnabled: true,
};

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

function parseLinks(value: unknown, fallback: FooterLink[]) {
  if (!Array.isArray(value)) return fallback;
  const links = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const label = typeof row.label === "string" ? row.label : "";
      const href = typeof row.href === "string" ? row.href : "";
      return { label, href };
    })
    .filter((item): item is FooterLink => Boolean(item));
  return links.length > 0 ? links : fallback;
}

function parseFooter(settings: SettingsMap): FooterConfig {
  const parsed = parseObject(settings.footer_config);
  return {
    shopInfoHtml:
      typeof parsed.shopInfoHtml === "string" ? parsed.shopInfoHtml : DEFAULT_FOOTER.shopInfoHtml,
    newsLinks: parseLinks(parsed.newsLinks, DEFAULT_FOOTER.newsLinks),
    policyLinks: parseLinks(parsed.policyLinks, DEFAULT_FOOTER.policyLinks),
    fanpageIframe: typeof parsed.fanpageIframe === "string" ? parsed.fanpageIframe : "",
    copyright:
      typeof parsed.copyright === "string"
        ? parsed.copyright
        : settings.footer_copyright || DEFAULT_FOOTER.copyright,
  };
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
  };
}

function cleanLinks(links: FooterLink[]) {
  return links
    .map((link) => ({ label: link.label.trim(), href: link.href.trim() }))
    .filter((link) => link.label && link.href);
}

function MessageBox({ message }: { message: { kind: "ok" | "err"; text: string } | null }) {
  if (!message) return null;
  return (
    <div
      className={`rounded-md border px-4 py-3 text-sm ${
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
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
    </label>
  );
}

function LinkArrayEditor({
  title,
  links,
  onChange,
}: {
  title: string;
  links: FooterLink[];
  onChange: (links: FooterLink[]) => void;
}) {
  function update(index: number, field: keyof FooterLink, value: string) {
    onChange(links.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={() => onChange([...links, { label: "", href: "" }])}
          className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100"
        >
          <Plus size={13} />
          Thêm mục
        </button>
      </div>
      <div className="space-y-3">
        {links.map((link, index) => (
          <div key={index} className="grid gap-2 rounded-md border border-slate-100 bg-slate-50 p-3">
            <input
              value={link.label}
              onChange={(event) => update(index, "label", event.target.value)}
              placeholder="Tên hiển thị"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
            />
            <div className="flex gap-2">
              <input
                value={link.href}
                onChange={(event) => update(index, "href", event.target.value)}
                placeholder="/duong-dan hoặc https://..."
                className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={() => onChange(links.filter((_, i) => i !== index))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                aria-label="Xóa mục"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
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
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3">
        <Lock size={16} className="text-sky-600" />
        <h2 className="text-lg font-semibold text-slate-800">Bảo mật</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextInput label="Mật khẩu hiện tại" type="password" value={currentPassword} onChange={setCurrentPassword} />
          <TextInput label="Mật khẩu mới" type="password" value={newPassword} onChange={setNewPassword} />
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
  const [activeTab, setActiveTab] = useState<"footer" | "system">("footer");
  const [settings, setSettings] = useState<SettingsMap>(initial);
  const [footer, setFooter] = useState<FooterConfig>(() => parseFooter(initial));
  const [savedFooter, setSavedFooter] = useState<FooterConfig>(() => parseFooter(initial));
  const [system, setSystem] = useState<SystemConfig>(() => parseSystem(initial));
  const [savedSystem, setSavedSystem] = useState<SystemConfig>(() => parseSystem(initial));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function persist(next: SettingsMap, okText: string) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ kind: "err", text: data.error || "Lưu thất bại" });
        return null;
      }
      const updated = (await res.json()) as SettingsMap;
      setSettings(updated);
      setMessage({ kind: "ok", text: okText });
      return updated;
    } catch {
      setMessage({ kind: "err", text: "Không kết nối được tới server" });
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function saveFooter(event: FormEvent) {
    event.preventDefault();
    const cleanFooter: FooterConfig = {
      ...footer,
      newsLinks: cleanLinks(footer.newsLinks),
      policyLinks: cleanLinks(footer.policyLinks),
      copyright: footer.copyright.trim(),
    };
    const updated = await persist(
      {
        ...settings,
        footer_config: JSON.stringify(cleanFooter),
        footer_copyright: cleanFooter.copyright,
        footer_show_fanpage: cleanFooter.fanpageIframe.trim() ? "1" : settings.footer_show_fanpage,
      },
      "Đã lưu Header & Footer"
    );
    if (updated) {
      const parsed = parseFooter(updated);
      setFooter(parsed);
      setSavedFooter(parsed);
    }
  }

  async function saveSystem(event: FormEvent) {
    event.preventDefault();
    const cleanSystem: SystemConfig = {
      ...system,
      gtmId: system.gtmId.trim(),
      facebookPixelId: system.facebookPixelId.trim(),
      defaultOgImage: system.defaultOgImage.trim(),
      orderNotifyEmail: system.orderNotifyEmail.trim(),
      freeShippingThreshold: Math.max(0, Math.round(Number(system.freeShippingThreshold) || 0)),
    };
    const updated = await persist(
      {
        ...settings,
        system_config: JSON.stringify(cleanSystem),
        gtm_id: cleanSystem.gtmId,
      },
      "Đã lưu cài đặt hệ thống"
    );
    if (updated) {
      const parsed = parseSystem(updated);
      setSystem(parsed);
      setSavedSystem(parsed);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 text-sm text-slate-500">
          <span className="font-medium text-sky-600">Bảng điều khiển</span>
          <span className="mx-2 text-slate-300">/</span>
          <span>Cấu hình</span>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 px-5 py-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab("footer");
                setMessage(null);
              }}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                activeTab === "footer" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Header & Footer
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("system");
                setMessage(null);
              }}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                activeTab === "system" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Cài đặt hệ thống
            </button>
          </div>

          <div className="p-5">
            <MessageBox message={message} />
          </div>

          {activeTab === "footer" ? (
            <form onSubmit={saveFooter} className="space-y-5 px-5 pb-5">
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                <section className="xl:col-span-1">
                  <h2 className="mb-3 text-sm font-bold text-slate-900">Thông tin Shop</h2>
                  <TiptapEditor
                    value={footer.shopInfoHtml}
                    onChange={(html) => setFooter((current) => ({ ...current, shopInfoHtml: html }))}
                    placeholder="Nhập thông tin shop..."
                    className="min-h-[300px]"
                  />
                </section>

                <LinkArrayEditor
                  title="Menu Tin tức"
                  links={footer.newsLinks}
                  onChange={(links) => setFooter((current) => ({ ...current, newsLinks: links }))}
                />
                <LinkArrayEditor
                  title="Menu Chính sách"
                  links={footer.policyLinks}
                  onChange={(links) => setFooter((current) => ({ ...current, policyLinks: links }))}
                />

                <section className="rounded-lg border border-slate-200 bg-white p-4">
                  <h2 className="mb-3 text-sm font-bold text-slate-900">Fanpage</h2>
                  <textarea
                    value={footer.fanpageIframe}
                    onChange={(event) => setFooter((current) => ({ ...current, fanpageIframe: event.target.value }))}
                    rows={10}
                    placeholder='<iframe src="https://www.facebook.com/plugins/page.php?..."></iframe>'
                    className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2.5 font-mono text-xs text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                  <TextInput
                    label="Copyright"
                    value={footer.copyright}
                    onChange={(value) => setFooter((current) => ({ ...current, copyright: value }))}
                  />
                </section>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
                >
                  <Save size={15} />
                  {saving ? "Đang lưu..." : "Lưu Header & Footer"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setFooter(savedFooter);
                    setMessage(null);
                  }}
                  className="inline-flex items-center gap-2 rounded bg-slate-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600 disabled:opacity-50"
                >
                  <RotateCcw size={15} />
                  Làm lại
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={saveSystem} className="space-y-5 px-5 pb-5">
              <section className="grid grid-cols-1 gap-5 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-2 xl:grid-cols-3">
                <TextInput label="Google Tag Manager ID" value={system.gtmId} onChange={(value) => setSystem((current) => ({ ...current, gtmId: value }))} placeholder="GTM-XXXXXXX" />
                <TextInput label="Facebook Pixel ID" value={system.facebookPixelId} onChange={(value) => setSystem((current) => ({ ...current, facebookPixelId: value }))} placeholder="1234567890" />
                <TextInput label="Default OG Image" value={system.defaultOgImage} onChange={(value) => setSystem((current) => ({ ...current, defaultOgImage: value }))} placeholder="/uploads/og.jpg" />
                <TextInput label="Email nhận thông báo đơn hàng" value={system.orderNotifyEmail} onChange={(value) => setSystem((current) => ({ ...current, orderNotifyEmail: value }))} placeholder="orders@example.com" />
                <TextInput label="Mức giá Freeship" type="number" value={system.freeShippingThreshold} onChange={(value) => setSystem((current) => ({ ...current, freeShippingThreshold: Number(value) }))} placeholder="1000000" />
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Popup xác nhận độ tuổi 18+</p>
                      <p className="mt-1 text-xs text-slate-500">Bật để yêu cầu khách xác nhận trước khi xem website.</p>
                    </div>
                    <Switch
                      checked={system.agePopupEnabled}
                      onCheckedChange={(checked) => setSystem((current) => ({ ...current, agePopupEnabled: checked }))}
                      aria-label="Bật tắt popup xác nhận độ tuổi"
                      className="h-6 w-11"
                    />
                  </div>
                </div>
              </section>

              <div className="flex flex-wrap gap-2">
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
          )}
        </div>
      </div>

      <PasswordSection />
    </div>
  );
}
