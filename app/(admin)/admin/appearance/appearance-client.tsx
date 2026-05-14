"use client";

import { useState } from "react";
import { GripVertical, LayoutTemplate, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import type { FooterConfig, FooterLink, SettingsMap } from "@/lib/settings";

interface NavLink {
  label: string;
  href: string;
}

interface AppearanceClientProps {
  settings: SettingsMap;
}

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

const DEFAULT_NAV: NavLink[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm", href: "/san-pham" },
  { label: "Tin tức", href: "/news" },
  { label: "Giới thiệu", href: "/gioi-thieu" },
  { label: "Liên hệ", href: "/lien-he" },
];

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

function parseNavLinks(raw: string) {
  try {
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return DEFAULT_NAV;
    const links = parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const row = item as Record<string, unknown>;
        const label = typeof row.label === "string" ? row.label : "";
        const href = typeof row.href === "string" ? row.href : "";
        return { label, href };
      })
      .filter((item): item is NavLink => Boolean(item));
    return links.length > 0 ? links : DEFAULT_NAV;
  } catch {
    return DEFAULT_NAV;
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
  const legacyInfo = [
    settings.footer_brand_name ? `<p><strong>${settings.footer_brand_name}</strong></p>` : "",
    settings.footer_brand_desc ? `<p>${settings.footer_brand_desc}</p>` : "",
    settings.footer_phone ? `<p>Hotline: ${settings.footer_phone}</p>` : "",
    settings.footer_email ? `<p>Email: ${settings.footer_email}</p>` : "",
    settings.footer_address ? `<p>Địa chỉ: ${settings.footer_address}</p>` : "",
  ].join("");

  return {
    shopInfoHtml:
      typeof parsed.shopInfoHtml === "string"
        ? parsed.shopInfoHtml
        : legacyInfo || DEFAULT_FOOTER.shopInfoHtml,
    newsLinks: parseLinks(parsed.newsLinks, DEFAULT_FOOTER.newsLinks),
    policyLinks: parseLinks(parsed.policyLinks, DEFAULT_FOOTER.policyLinks),
    fanpageIframe: typeof parsed.fanpageIframe === "string" ? parsed.fanpageIframe : "",
    copyright:
      typeof parsed.copyright === "string"
        ? parsed.copyright
        : settings.footer_copyright || DEFAULT_FOOTER.copyright,
  };
}

function cleanLinks<T extends { label: string; href: string }>(links: T[]) {
  return links
    .map((link) => ({ label: link.label.trim(), href: link.href.trim() }))
    .filter((link) => link.label && link.href);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-3 text-base font-bold text-slate-800">
      <LayoutTemplate size={16} className="text-sky-500" />
      {children}
    </h2>
  );
}

function Label({ children, helper }: { children: React.ReactNode; helper?: string }) {
  return (
    <div className="mb-1.5">
      <label className="text-sm font-semibold text-slate-700">{children}</label>
      {helper ? <p className="mt-0.5 text-xs text-slate-400">{helper}</p> : null}
    </div>
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
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
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
              className={inputClass}
            />
            <div className="flex gap-2">
              <input
                value={link.href}
                onChange={(event) => update(index, "href", event.target.value)}
                placeholder="/duong-dan hoặc https://..."
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => onChange(links.filter((_, i) => i !== index))}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
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

export function AppearanceClient({ settings }: AppearanceClientProps) {
  const [siteName, setSiteName] = useState(settings.header_site_name || "Rượu Truyền Thống");
  const [zaloLabel, setZaloLabel] = useState(settings.header_zalo_label || "Chat Zalo");
  const [navLinks, setNavLinks] = useState<NavLink[]>(() => parseNavLinks(settings.header_nav_links));
  const [footer, setFooter] = useState<FooterConfig>(() => parseFooter(settings));
  const [savedFooter, setSavedFooter] = useState<FooterConfig>(() => parseFooter(settings));
  const [savedNav, setSavedNav] = useState<NavLink[]>(() => parseNavLinks(settings.header_nav_links));
  const [savedSiteName, setSavedSiteName] = useState(settings.header_site_name || "Rượu Truyền Thống");
  const [savedZaloLabel, setSavedZaloLabel] = useState(settings.header_zalo_label || "Chat Zalo");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function addNavLink() {
    setNavLinks((prev) => [...prev, { label: "", href: "/" }]);
  }
  function removeNavLink(index: number) {
    setNavLinks((prev) => prev.filter((_, i) => i !== index));
  }
  function updateNavLink(index: number, field: keyof NavLink, value: string) {
    setNavLinks((prev) => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  }
  function moveNavLink(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= navLinks.length) return;
    const arr = [...navLinks];
    [arr[index], arr[next]] = [arr[next], arr[index]];
    setNavLinks(arr);
  }

  function reset() {
    setSiteName(savedSiteName);
    setZaloLabel(savedZaloLabel);
    setNavLinks(savedNav);
    setFooter(savedFooter);
    setMsg(null);
  }

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const cleanFooter: FooterConfig = {
        ...footer,
        newsLinks: cleanLinks(footer.newsLinks),
        policyLinks: cleanLinks(footer.policyLinks),
        copyright: footer.copyright.trim(),
      };
      const cleanNav = cleanLinks(navLinks);
      const payload: Record<string, string> = {
        header_site_name: siteName.trim(),
        header_nav_links: JSON.stringify(cleanNav),
        header_zalo_label: zaloLabel.trim(),
        footer_config: JSON.stringify(cleanFooter),
        footer_copyright: cleanFooter.copyright,
        footer_show_fanpage: cleanFooter.fanpageIframe.trim() ? "1" : settings.footer_show_fanpage,
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Lưu thất bại");
      }
      setSavedSiteName(siteName.trim());
      setSavedZaloLabel(zaloLabel.trim());
      setSavedNav(cleanNav);
      setNavLinks(cleanNav);
      setSavedFooter(cleanFooter);
      setFooter(cleanFooter);
      setMsg({ kind: "ok", text: "Đã lưu Header & Footer" });
    } catch (error) {
      setMsg({ kind: "err", text: error instanceof Error ? error.message : "Lưu thất bại" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Giao diện - Header & Footer</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tùy chỉnh đầu trang, chân trang, menu và nội dung hiển thị ngoài website.
        </p>
      </div>

      {msg ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            msg.kind === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {msg.text}
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionTitle>Header</SectionTitle>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label helper="Tên thương hiệu hiển thị trên thanh điều hướng">Tên thương hiệu</Label>
              <input className={inputClass} value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>
            <div>
              <Label helper="Nhãn nút Zalo ở góc phải header">Nhãn nút Zalo</Label>
              <input className={inputClass} value={zaloLabel} onChange={(e) => setZaloLabel(e.target.value)} />
            </div>
          </div>

          <div>
            <Label helper="Các mục menu điều hướng, dùng nút lên/xuống để sắp xếp">Menu điều hướng</Label>
            <div className="mt-2 space-y-2">
              {navLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button type="button" onClick={() => moveNavLink(index, -1)} disabled={index === 0} className="rounded p-0.5 hover:bg-slate-100 disabled:opacity-30">
                      <GripVertical size={14} className="rotate-90 text-slate-400" />
                    </button>
                    <button type="button" onClick={() => moveNavLink(index, 1)} disabled={index === navLinks.length - 1} className="rounded p-0.5 hover:bg-slate-100 disabled:opacity-30">
                      <GripVertical size={14} className="-rotate-90 text-slate-400" />
                    </button>
                  </div>
                  <input className={inputClass} value={link.label} onChange={(e) => updateNavLink(index, "label", e.target.value)} placeholder="Tên menu" />
                  <input className={inputClass} value={link.href} onChange={(e) => updateNavLink(index, "href", e.target.value)} placeholder="/duong-dan" />
                  <button type="button" onClick={() => removeNavLink(index)} className="rounded p-2 text-red-400 hover:bg-red-50 hover:text-red-600" aria-label="Xóa menu">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addNavLink} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 hover:border-sky-400 hover:text-sky-600">
              <Plus size={14} /> Thêm mục menu
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionTitle>Footer</SectionTitle>
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <div>
            <Label helper="Dùng editor để tự định dạng chữ, màu sắc và đoạn văn">Thông tin Shop</Label>
            <TiptapEditor
              value={footer.shopInfoHtml}
              onChange={(html) => setFooter((current) => ({ ...current, shopInfoHtml: html }))}
              placeholder="Nhập thông tin shop..."
              className="min-h-[300px]"
            />
          </div>

          <div className="space-y-5">
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
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-slate-900">Fanpage</h3>
            <textarea
              value={footer.fanpageIframe}
              onChange={(event) => setFooter((current) => ({ ...current, fanpageIframe: event.target.value }))}
              rows={10}
              placeholder='<iframe src="https://www.facebook.com/plugins/page.php?..."></iframe>'
              className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2.5 font-mono text-xs text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
            <div className="mt-4">
              <Label>Copyright</Label>
              <input
                className={inputClass}
                value={footer.copyright}
                onChange={(event) => setFooter((current) => ({ ...current, copyright: event.target.value }))}
              />
            </div>
          </section>
        </div>
      </section>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 border-t border-slate-200 bg-gray-50/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
        >
          <Save size={15} />
          {saving ? "Đang lưu..." : "Lưu Header & Footer"}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded bg-slate-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600 disabled:opacity-50"
        >
          <RotateCcw size={15} />
          Làm lại
        </button>
      </div>
    </div>
  );
}
