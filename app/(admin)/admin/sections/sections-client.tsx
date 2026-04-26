"use client";

import { useState } from "react";

type Value = { text: string; image: string | null };

interface Props {
  keys: string[];
  initialValues: Record<string, Value>;
}

function groupKeys(keys: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const key of keys) {
    const parts = key.split(".");
    const group = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : "other";
    if (!groups[group]) groups[group] = [];
    groups[group].push(key);
  }
  return groups;
}

const GROUP_LABEL: Record<string, string> = {
  "home.hero": "Trang chủ — Hero",
  "home.cta": "Trang chủ — CTA",
};

const LONG_FIELDS = new Set(["home.hero.subtitle", "home.cta.body"]);

export function SectionsClient({ keys, initialValues }: Props) {
  const [values, setValues] = useState<Record<string, Value>>(() => {
    const map: Record<string, Value> = {};
    for (const k of keys) {
      map[k] = initialValues[k] ?? { text: "", image: null };
    }
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const groups = groupKeys(keys);

  function updateText(key: string, text: string) {
    setValues((prev) => ({ ...prev, [key]: { ...(prev[key] ?? { text: "", image: null }), text } }));
  }

  function updateImage(key: string, image: string | null) {
    setValues((prev) => ({ ...prev, [key]: { ...(prev[key] ?? { text: "", image: null }), image } }));
  }

  async function handleUpload(key: string, file: File) {
    setUploadingKey(key);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "section");
      const res = await fetch("/api/media", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: "err", text: data.error || "Upload thất bại" });
        return;
      }
      const data = await res.json();
      if (typeof data.url === "string") {
        updateImage(key, data.url);
      }
    } catch {
      setMessage({ type: "err", text: "Không kết nối được tới server" });
    } finally {
      setUploadingKey(null);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload: Record<string, Value> = {};
      for (const k of keys) {
        const v = values[k] ?? { text: "", image: null };
        payload[k] = { text: v.text ?? "", image: v.image ?? null };
      }
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: "err", text: data.error || "Lưu thất bại" });
        return;
      }
      const data = await res.json();
      if (data.values) setValues(data.values);
      setMessage({ type: "ok", text: "Đã lưu" });
    } catch {
      setMessage({ type: "err", text: "Không kết nối được tới server" });
    } finally {
      setSaving(false);
    }
  }

  function clearField(key: string) {
    setValues((prev) => ({ ...prev, [key]: { text: "", image: null } }));
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Nội dung các section</h1>
          <p className="text-sm text-gray-600">
            Key theo chuẩn{" "}
            <code className="rounded bg-gray-100 px-1 text-xs">page.section.field</code>.
            Mỗi key lưu JSON <code className="rounded bg-gray-100 px-1 text-xs">{`{ "text", "image" }`}</code>.
          </p>
          <p className="text-xs text-amber-700">
            Nếu bỏ trống: frontend sẽ không hiển thị phần đó (không có dữ liệu mặc định).
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-[#8B1A1A] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu tất cả"}
        </button>
      </div>

      {message && (
        <div
          className={`rounded px-3 py-2 text-sm ${
            message.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {Object.entries(groups).map(([groupKey, groupKeys]) => (
        <fieldset key={groupKey} className="rounded border bg-white p-3 sm:p-4">
          <legend className="px-2 text-sm font-semibold text-gray-700">
            {GROUP_LABEL[groupKey] ?? groupKey}
          </legend>
          <div className="space-y-5">
            {groupKeys.map((key) => {
              const v = values[key] ?? { text: "", image: null };
              const isLong = LONG_FIELDS.has(key);
              const field = key.split(".").pop();
              const isUploading = uploadingKey === key;
              return (
                <div key={key} className="rounded border border-gray-100 p-3">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <label htmlFor={`sec-${key}`} className="text-xs font-medium text-gray-700">
                      {field}{" "}
                      <span className="font-normal text-gray-400">— {key}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => clearField(key)}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Xóa nội dung
                    </button>
                  </div>

                  {isLong ? (
                    <textarea
                      id={`sec-${key}`}
                      value={v.text}
                      onChange={(e) => updateText(key, e.target.value)}
                      rows={4}
                      className="w-full rounded border px-3 py-2 text-sm"
                      placeholder="Để trống = không hiển thị"
                    />
                  ) : (
                    <input
                      id={`sec-${key}`}
                      type="text"
                      value={v.text}
                      onChange={(e) => updateText(key, e.target.value)}
                      className="w-full rounded border px-3 py-2 text-sm"
                      placeholder="Để trống = không hiển thị"
                    />
                  )}

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr]">
                    <div className="relative h-20 w-32 overflow-hidden rounded border bg-gray-100">
                      {v.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          Chưa có ảnh
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={v.image ?? ""}
                        onChange={(e) => updateImage(key, e.target.value || null)}
                        placeholder="URL ảnh (vd: /uploads/xxx.jpg) hoặc để trống"
                        className="w-full rounded border px-3 py-1.5 text-xs"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded border px-2 py-1 text-xs hover:bg-gray-50">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) void handleUpload(key, f);
                              e.currentTarget.value = "";
                            }}
                          />
                          {isUploading ? "Đang tải lên..." : "Tải ảnh lên"}
                        </label>
                        {v.image && (
                          <button
                            type="button"
                            onClick={() => updateImage(key, null)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Gỡ ảnh
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-[#8B1A1A] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu tất cả"}
        </button>
      </div>
    </form>
  );
}
