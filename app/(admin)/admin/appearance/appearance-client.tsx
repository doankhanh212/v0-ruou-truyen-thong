"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, LayoutTemplate } from "lucide-react";
import type { SettingsMap } from "@/lib/settings";

interface NavLink { label: string; href: string }

interface AppearanceClientProps {
  settings: SettingsMap;
}

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800 border-b border-slate-200 pb-2">
      <LayoutTemplate size={16} className="text-sky-500" />
      {children}
    </h2>
  );
}

function Label({ children, helper }: { children: React.ReactNode; helper?: string }) {
  return (
    <div className="mb-1">
      <label className="text-sm font-semibold text-slate-700">{children}</label>
      {helper && <p className="text-xs text-slate-400 mt-0.5">{helper}</p>}
    </div>
  );
}

export function AppearanceClient({ settings }: AppearanceClientProps) {
  // --- Header state ---
  const [siteName, setSiteName] = useState(settings.header_site_name || "Rượu Truyền Thống");
  const [zaloLabel, setZaloLabel] = useState(settings.header_zalo_label || "Chat Zalo");
  const [navLinks, setNavLinks] = useState<NavLink[]>(() => {
    try { return JSON.parse(settings.header_nav_links || "[]"); } catch { return []; }
  });

  // --- Footer state ---
  const [brandName, setBrandName] = useState(settings.footer_brand_name || "");
  const [brandDesc, setBrandDesc] = useState(settings.footer_brand_desc || "");
  const [footerPhone, setFooterPhone] = useState(settings.footer_phone || "");
  const [footerEmail, setFooterEmail] = useState(settings.footer_email || "");
  const [footerAddress, setFooterAddress] = useState(settings.footer_address || "");
  const [footerCopyright, setFooterCopyright] = useState(settings.footer_copyright || "");
  const [showFanpage, setShowFanpage] = useState(settings.footer_show_fanpage !== "0");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // --- Nav link helpers ---
  function addNavLink() {
    setNavLinks((prev) => [...prev, { label: "", href: "/" }]);
  }
  function removeNavLink(index: number) {
    setNavLinks((prev) => prev.filter((_, i) => i !== index));
  }
  function updateNavLink(index: number, field: keyof NavLink, value: string) {
    setNavLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  }
  function moveNavLink(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= navLinks.length) return;
    const arr = [...navLinks];
    [arr[index], arr[next]] = [arr[next], arr[index]];
    setNavLinks(arr);
  }

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const payload: Record<string, string> = {
        header_site_name: siteName.trim(),
        header_nav_links: JSON.stringify(navLinks.filter((l) => l.label && l.href)),
        header_zalo_label: zaloLabel.trim(),
        footer_brand_name: brandName.trim(),
        footer_brand_desc: brandDesc.trim(),
        footer_phone: footerPhone.trim(),
        footer_email: footerEmail.trim(),
        footer_address: footerAddress.trim(),
        footer_copyright: footerCopyright.trim(),
        footer_show_fanpage: showFanpage ? "1" : "0",
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg({ kind: "ok", text: "Đã lưu thành công!" });
    } catch {
      setMsg({ kind: "err", text: "Lưu thất bại, vui lòng thử lại." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Giao diện – Header & Footer</h1>
          <p className="mt-1 text-sm text-slate-500">Tuỳ chỉnh đầu trang và chân trang hiển thị phía người dùng.</p>
        </div>

        <div className="space-y-8">
          {/* ── HEADER ── */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>Header (Đầu trang)</SectionTitle>
            <div className="space-y-4">
              <div>
                <Label helper="Tên thương hiệu hiển thị trên thanh điều hướng">Tên thương hiệu</Label>
                <input className={inputClass} value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Rượu Truyền Thống" />
              </div>
              <div>
                <Label helper="Nhãn nút Zalo ở góc phải header">Nhãn nút Zalo</Label>
                <input className={inputClass} value={zaloLabel} onChange={(e) => setZaloLabel(e.target.value)} placeholder="Chat Zalo" />
              </div>

              {/* Nav links */}
              <div>
                <Label helper="Các mục menu điều hướng, kéo để sắp xếp thứ tự">Menu điều hướng</Label>
                <div className="mt-2 space-y-2">
                  {navLinks.map((link, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex flex-col gap-0.5">
                        <button type="button" onClick={() => moveNavLink(i, -1)} disabled={i === 0} className="rounded p-0.5 hover:bg-slate-100 disabled:opacity-30">
                          <GripVertical size={14} className="rotate-90 text-slate-400" />
                        </button>
                        <button type="button" onClick={() => moveNavLink(i, 1)} disabled={i === navLinks.length - 1} className="rounded p-0.5 hover:bg-slate-100 disabled:opacity-30">
                          <GripVertical size={14} className="-rotate-90 text-slate-400" />
                        </button>
                      </div>
                      <input
                        className={`${inputClass} flex-1`}
                        value={link.label}
                        onChange={(e) => updateNavLink(i, "label", e.target.value)}
                        placeholder="Tên menu (vd: Sản phẩm)"
                      />
                      <input
                        className={`${inputClass} flex-1`}
                        value={link.href}
                        onChange={(e) => updateNavLink(i, "href", e.target.value)}
                        placeholder="Đường dẫn (vd: /san-pham)"
                      />
                      <button type="button" onClick={() => removeNavLink(i)} className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addNavLink} className="mt-2 flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 hover:border-sky-400 hover:text-sky-600">
                  <Plus size={14} /> Thêm mục menu
                </button>
              </div>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionTitle>Footer (Chân trang)</SectionTitle>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Tên thương hiệu</Label>
                  <input className={inputClass} value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Rượu Truyền Thống" />
                </div>
                <div>
                  <Label helper="Số điện thoại / Zalo hiển thị">Số điện thoại</Label>
                  <input className={inputClass} value={footerPhone} onChange={(e) => setFooterPhone(e.target.value)} placeholder="0909 799 311 – 0902 931 119" />
                </div>
                <div>
                  <Label>Email</Label>
                  <input className={inputClass} value={footerEmail} onChange={(e) => setFooterEmail(e.target.value)} placeholder="somogold@somogroup.vn" />
                </div>
                <div>
                  <Label>Địa chỉ</Label>
                  <input className={inputClass} value={footerAddress} onChange={(e) => setFooterAddress(e.target.value)} placeholder="29 Nguyễn Khắc Nhu, TP. HCM" />
                </div>
              </div>
              <div>
                <Label helper="Dòng mô tả ngắn dưới tên thương hiệu">Mô tả thương hiệu</Label>
                <textarea className={`${inputClass} resize-y`} rows={3} value={brandDesc} onChange={(e) => setBrandDesc(e.target.value)} placeholder="Rượu truyền thống cao cấp..." />
              </div>
              <div>
                <Label helper="Dòng copyright ở cuối footer">Copyright</Label>
                <input className={inputClass} value={footerCopyright} onChange={(e) => setFooterCopyright(e.target.value)} placeholder="Rượu Truyền Thống. Tất cả các quyền được bảo lưu." />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="show-fanpage"
                  checked={showFanpage}
                  onChange={(e) => setShowFanpage(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600"
                />
                <label htmlFor="show-fanpage" className="text-sm font-medium text-slate-700">
                  Hiển thị widget Fanpage Facebook
                </label>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            {msg && (
              <span className={`text-sm font-medium ${msg.kind === "ok" ? "text-green-600" : "text-red-600"}`}>
                {msg.text}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
