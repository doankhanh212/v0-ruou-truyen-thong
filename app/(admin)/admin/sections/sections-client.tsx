"use client";

import { useRef, useState } from "react";
import { Home, MessageSquare, Image as ImageIcon, Tag, Type, Sparkles, MousePointerClick, BarChart3 } from "lucide-react";

type Value = { text: string; image: string | null };

interface Props {
  keys: string[];
  initialValues: Record<string, Value>;
}

/**
 * Friendly labels + groups for the business owner.
 * Each entry tells the admin EXACTLY where this content shows up.
 */
type FieldMeta = {
  label: string;
  hint: string;
  long?: boolean;
  hasImage?: boolean;
  icon: typeof Type;
};

const FIELD_META: Record<string, FieldMeta> = {
  "home.hero.badge": {
    label: "Nhãn dán nhỏ phía trên tiêu đề",
    hint: "Ví dụ: 'Đặc sản miền Tây' — hiển thị trên cùng banner trang chủ",
    icon: Tag,
  },
  "home.hero.title": {
    label: "Tiêu đề chính (dòng 1)",
    hint: "Dòng to nhất ở banner trang chủ. Ví dụ: 'Rượu Truyền Thống'",
    icon: Type,
  },
  "home.hero.title_accent": {
    label: "Tiêu đề nhấn (dòng 2, in đậm khác màu)",
    hint: "Phần nổi bật của tiêu đề, hiển thị màu khác. Ví dụ: 'Truyền Thống'",
    icon: Sparkles,
  },
  "home.hero.subtitle": {
    label: "Mô tả ngắn dưới tiêu đề",
    hint: "Câu giới thiệu 1-2 dòng dưới tiêu đề",
    long: true,
    icon: Type,
  },
  "home.hero.cta_primary_label": {
    label: "Chữ trên nút bấm chính (Zalo)",
    hint: "Ví dụ: 'Tư vấn ngay' — nút màu nổi bật",
    icon: MousePointerClick,
  },
  "home.hero.cta_secondary_label": {
    label: "Chữ trên nút bấm phụ",
    hint: "Ví dụ: 'Xem sản phẩm' — nút viền",
    icon: MousePointerClick,
  },
  "home.hero.stat_number": {
    label: "Con số nổi bật trên ảnh",
    hint: "Ví dụ: '15+' — hiển thị overlay trên banner",
    icon: BarChart3,
  },
  "home.hero.stat_label": {
    label: "Chú thích cho con số",
    hint: "Ví dụ: 'Năm kinh nghiệm' — đi kèm con số ở trên",
    icon: BarChart3,
  },
  "home.cta.title": {
    label: "Tiêu đề khối kêu gọi (cuối trang)",
    hint: "Tiêu đề lớn của khối CTA cuối trang chủ",
    icon: Type,
  },
  "home.cta.body": {
    label: "Nội dung mô tả khối kêu gọi",
    hint: "Đoạn văn mô tả phía dưới tiêu đề CTA",
    long: true,
    icon: Type,
  },
  "home.cta.primary_label": {
    label: "Chữ trên nút bấm chính (CTA)",
    hint: "Ví dụ: 'Đặt mua ngay'",
    icon: MousePointerClick,
  },
  "home.cta.secondary_label": {
    label: "Chữ trên nút bấm phụ (CTA)",
    hint: "Ví dụ: 'Xem báo giá'",
    icon: MousePointerClick,
  },
};

type GroupMeta = {
  label: string;
  description: string;
  icon: typeof Home;
};

const GROUPS: Record<string, GroupMeta> = {
  "home.hero": {
    label: "Trang chủ — Banner đầu trang",
    description: "Phần lớn nhất khi khách vừa vào website. Cập nhật ở đây sẽ thay đổi tiêu đề + nút bấm trên cùng.",
    icon: Home,
  },
  "home.cta": {
    label: "Trang chủ — Khối kêu gọi cuối trang",
    description: "Khối kêu gọi mua hàng đặt ở phía cuối trang chủ, ngay trước phần liên hệ.",
    icon: MessageSquare,
  },
};

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

// Only fields under a hero-style block need image control. CTA labels don't.
const KEYS_WITH_IMAGE = new Set<string>([]);

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
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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
        setMessage({ type: "err", text: data.error || "Tải ảnh thất bại" });
        return;
      }
      const data = await res.json();
      if (typeof data.url === "string") {
        updateImage(key, data.url);
      }
    } catch (err) {
      console.error("[sections upload]", err);
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
      setMessage({ type: "ok", text: "Đã lưu thành công" });
    } catch (err) {
      console.error("[sections save]", err);
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
      {/* Sticky header with save button */}
      <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 border-b bg-gray-50/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Nội dung trang chủ</h1>
            <p className="mt-1 text-sm text-gray-600">
              Sửa tiêu đề, nút bấm và mô tả trên trang chủ. Nhấn <strong>Lưu tất cả</strong> để áp dụng.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#8B1A1A] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#6f1414] disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu tất cả"}
          </button>
        </div>
        {message && (
          <div
            className={`mt-3 rounded-lg px-3 py-2 text-sm ${
              message.type === "ok"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      {Object.entries(groups).map(([groupKey, groupKeys]) => {
        const meta = GROUPS[groupKey];
        const GroupIcon = meta?.icon ?? Home;

        return (
          <section key={groupKey} className="overflow-hidden rounded-xl border bg-white shadow-sm">
            {/* Group header */}
            <header className="flex items-start gap-3 border-b bg-gradient-to-br from-amber-50 to-white px-4 py-4 sm:px-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#8B1A1A]/10 text-[#8B1A1A]">
                <GroupIcon size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                  {meta?.label ?? groupKey}
                </h2>
                {meta?.description && (
                  <p className="mt-1 text-sm text-gray-600">{meta.description}</p>
                )}
              </div>
            </header>

            <div className="divide-y">
              {groupKeys.map((key) => {
                const v = values[key] ?? { text: "", image: null };
                const fieldMeta = FIELD_META[key];
                const FieldIcon = fieldMeta?.icon ?? Type;
                const isLong = fieldMeta?.long ?? false;
                const showImage = KEYS_WITH_IMAGE.has(key);
                const isUploading = uploadingKey === key;

                return (
                  <div key={key} className="px-4 py-4 sm:px-6 sm:py-5">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <FieldIcon size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
                        <div>
                          <label
                            htmlFor={`sec-${key}`}
                            className="block text-sm font-medium text-gray-900"
                          >
                            {fieldMeta?.label ?? key}
                          </label>
                          {fieldMeta?.hint && (
                            <p className="mt-0.5 text-xs text-gray-500">{fieldMeta.hint}</p>
                          )}
                        </div>
                      </div>
                      {(v.text || v.image) && (
                        <button
                          type="button"
                          onClick={() => clearField(key)}
                          className="text-xs text-gray-400 hover:text-red-600 hover:underline"
                        >
                          Xóa
                        </button>
                      )}
                    </div>

                    {isLong ? (
                      <textarea
                        id={`sec-${key}`}
                        value={v.text}
                        onChange={(e) => updateText(key, e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]"
                        placeholder="Để trống nếu không muốn hiển thị"
                      />
                    ) : (
                      <input
                        id={`sec-${key}`}
                        type="text"
                        value={v.text}
                        onChange={(e) => updateText(key, e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]"
                        placeholder="Để trống nếu không muốn hiển thị"
                      />
                    )}

                    {showImage && (
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
                        <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                          {v.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={v.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              ref={(el) => {
                                fileInputRefs.current[key] = el;
                              }}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) void handleUpload(key, f);
                                e.currentTarget.value = "";
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[key]?.click()}
                              disabled={isUploading}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                              {isUploading ? "Đang tải..." : v.image ? "Đổi ảnh" : "Tải ảnh lên"}
                            </button>
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
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Footer save button (in case sticky doesn't help on mobile) */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#8B1A1A] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#6f1414] disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu tất cả"}
        </button>
      </div>
    </form>
  );
}
