"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { SettingsMap } from "@/lib/settings";

type Field = {
  key: keyof SettingsMap;
  label: string;
  placeholder?: string;
  helper?: string;
  multiline?: boolean;
  rows?: number;
  span?: "full" | "normal";
};

const PRIMARY_FIELDS: Field[] = [
  { key: "address", label: "Địa chỉ", placeholder: "29 Nguyễn Khắc Nhu, Phường Cầu Ông Lãnh, TP.HCM" },
  { key: "email", label: "Email", placeholder: "sale3.somogold@gmail.com" },
  { key: "hotline", label: "Hotline", placeholder: "0902 931 119" },
  { key: "phone", label: "Điện thoại", placeholder: "Người liên hệ hoặc số phụ trách" },
  { key: "zalo_url", label: "Zalo", placeholder: "https://zalo.me/0902931119" },
  { key: "zalo_oaid", label: "OAID Zalo", placeholder: "OAID Zalo" },
  { key: "website", label: "Website", placeholder: "https://cuulongmytuu.vn/" },
  { key: "fanpage_url", label: "Fanpage", placeholder: "https://www.facebook.com/cuulongmytuu/" },
  { key: "copyright", label: "Copyright", placeholder: "Bản quyền © 2026 ..." },
  { key: "home_page_size", label: "Phân trang chủ", placeholder: "16", helper: "Số sản phẩm hiển thị trên trang chủ" },
  { key: "google_map_coords", label: "Tọa độ Google Map", placeholder: "10.762667797410737,106.68600295483124" },
];

const EMBED_FIELDS: Field[] = [
  {
    key: "google_map_embed",
    label: "Tọa độ google map iframe",
    placeholder: "<iframe src=...></iframe>",
    helper: "Dán toàn bộ iframe hoặc mã nhúng Google Maps.",
    multiline: true,
    rows: 5,
    span: "full",
  },
  {
    key: "google_analytics",
    label: "Google analytics",
    placeholder: "<script async src=...></script>",
    helper: "Lưu mã GA4 hoặc đoạn script analytics để quản trị nội bộ.",
    multiline: true,
    rows: 6,
    span: "full",
  },
];

function SettingsInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) {
  const baseClass = "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

  return (
    <div className={field.span === "full" ? "md:col-span-3" : ""}>
      <label className="mb-2 block text-sm font-semibold text-slate-800">{field.label}:</label>
      {field.multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={field.rows ?? 4}
          placeholder={field.placeholder}
          className={`${baseClass} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
          className={baseClass}
        />
      )}
      {field.helper ? <p className="mt-1 text-xs text-slate-500">{field.helper}</p> : null}
    </div>
  );
}

export function SettingsClient({ initial }: { initial: SettingsMap }) {
  const [values, setValues] = useState<SettingsMap>(initial);
  const [savedValues, setSavedValues] = useState<SettingsMap>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function updateField(key: keyof SettingsMap, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleReset() {
    setValues(savedValues);
    setMessage(null);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ kind: "err", text: data.error || "Lưu thất bại" });
      } else {
        const updated = (await res.json()) as SettingsMap;
        setValues(updated);
        setSavedValues(updated);
        setMessage({ kind: "ok", text: "Đã lưu thông tin công ty" });
      }
    } catch {
      setMessage({ kind: "err", text: "Không kết nối được tới server" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div>
        <div className="mb-2 text-sm text-slate-500">
          <span className="font-medium text-sky-600">Bảng điều khiển</span>
          <span className="mx-2 text-slate-300">/</span>
          <span>Thông tin công ty</span>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b-2 border-sky-500 px-5 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="inline-flex items-center rounded bg-slate-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600 disabled:opacity-50"
              >
                Làm lại
              </button>
            </div>
          </div>

          {message ? (
            <div
              className={`mx-5 mt-4 rounded-md border px-4 py-3 text-sm ${
                message.kind === "ok"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {message.text}
            </div>
          ) : null}

          <section className="mt-4 border-t border-slate-200">
            <div className="border-b border-slate-200 px-5 py-3">
              <h1 className="text-xl font-semibold text-slate-800">Thông tin chung</h1>
            </div>

            <div className="grid grid-cols-1 gap-5 px-5 py-5 md:grid-cols-2 xl:grid-cols-3">
              {PRIMARY_FIELDS.map((field) => (
                <SettingsInput
                  key={field.key}
                  field={field}
                  value={values[field.key] ?? ""}
                  onChange={(event) => updateField(field.key, event.target.value)}
                />
              ))}
            </div>
          </section>

          <section className="border-t border-slate-200">
            <div className="border-b border-slate-200 px-5 py-3">
              <h2 className="text-lg font-semibold text-slate-800">Mã nhúng và theo dõi</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 px-5 py-5 md:grid-cols-2 xl:grid-cols-3">
              {EMBED_FIELDS.map((field) => (
                <SettingsInput
                  key={field.key}
                  field={field}
                  value={values[field.key] ?? ""}
                  onChange={(event) => updateField(field.key, event.target.value)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
