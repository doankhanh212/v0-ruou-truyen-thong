"use client";

import { useRef, useState } from "react";
import {
  Home,
  MessageSquare,
  Image as ImageIcon,
  Tag,
  Type,
  Sparkles,
  MousePointerClick,
  BarChart3,
  ShieldCheck,
  Package,
  type LucideIcon,
} from "lucide-react";

type Value = { text: string; image: string | null };

interface Props {
  keys: string[];
  initialValues: Record<string, Value>;
}

type FieldMeta = {
  label: string;
  hint: string;
  long?: boolean;
  hasImage?: boolean;
  imagePrompt?: string;
  icon: LucideIcon;
};

const DEFAULT_VALUES: Record<string, Value> = {
  "home.trust.label": { text: "Tinh Hoa Rượu Việt", image: null },
  "home.trust.title": {
    text: "Tại sao Rượu Truyền Thống Cửu Long là lựa chọn hàng đầu?",
    image: null,
  },
  "home.trust.card1_eyebrow": { text: "Chất lượng thực", image: null },
  "home.trust.card1_title": { text: "Trọn Vẹn Hương Vị Truyền Thống", image: null },
  "home.trust.card1_desc": {
    text: "100% hình ảnh trên website là sản phẩm thực tế. Chúng tôi cam kết chất lượng nguyên bản, mang đến trải nghiệm tinh túy nhất từ nhà lò đến tay khách hàng.",
    image: null,
  },
  "home.trust.card2_eyebrow": { text: "Quà tặng doanh nghiệp", image: null },
  "home.trust.card2_title": { text: "Nâng Tầm Đẳng Cấp Biếu Tặng", image: null },
  "home.trust.card2_desc": {
    text: "Thiết kế bình sứ Bát Tràng sang trọng. Lựa chọn hoàn hảo để tri ân đối tác và khách VIP.",
    image: null,
  },
};

const FIELD_META: Record<string, FieldMeta> = {
  // Hero
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
  // CTA cuối trang
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
  // Trust
  "home.trust.label": {
    label: "Nhãn nhỏ phía trên tiêu đề",
    hint: "Ví dụ: 'Tại sao chọn chúng tôi'",
    icon: Tag,
  },
  "home.trust.title": {
    label: "Tiêu đề chính",
    hint: "Ví dụ: 'Được tin tưởng vì lý do chính đáng'",
    icon: Type,
  },
  // Trust cards
  "home.trust.card1_eyebrow": {
    label: "Card 1 — Nhãn nhỏ phía trên",
    hint: "Ví dụ: 'Catalog thật'",
    icon: Tag,
  },
  "home.trust.card1_title": {
    label: "Card 1 — Tiêu đề lớn",
    hint: "Ví dụ: 'Dòng rượu và bộ quà đã lên web bằng ảnh gốc'",
    icon: Type,
  },
  "home.trust.card1_desc": {
    label: "Card 1 — Mô tả ngắn",
    hint: "Đoạn mô tả 1-2 dòng dưới tiêu đề card 1",
    long: true,
    icon: Type,
  },
  "home.trust.card1_image": {
    label: "Card 1 — Ảnh nền",
    hint: "Tỉ lệ 16:9. Hiển thị ở card lớn bên trái.",
    imagePrompt:
      "Ảnh chụp thực tế phong cách premium documentary, tỉ lệ 16:9, xưởng nấu rượu truyền thống Việt Nam, chum sành, hơi rượu, ánh sáng tự nhiên ấm, sản phẩm rượu thật là điểm nhấn, không chữ, không logo, không minh họa hoạt hình.",
    hasImage: true,
    icon: ImageIcon,
  },
  "home.trust.card2_eyebrow": {
    label: "Card 2 — Nhãn nhỏ phía trên",
    hint: "Ví dụ: 'Biếu tặng cao cấp'",
    icon: Tag,
  },
  "home.trust.card2_title": {
    label: "Card 2 — Tiêu đề lớn",
    hint: "Ví dụ: 'Phù hợp quà Tết, quà đối tác và khách VIP'",
    icon: Type,
  },
  "home.trust.card2_desc": {
    label: "Card 2 — Mô tả ngắn (tuỳ chọn)",
    hint: "Có thể để trống nếu chỉ cần tiêu đề",
    long: true,
    icon: Type,
  },
  "home.trust.card2_image": {
    label: "Card 2 — Ảnh nền",
    hint: "Tỉ lệ 4:5 (dọc). Hiển thị ở card nhỏ bên phải.",
    imagePrompt:
      "Ảnh chụp sản phẩm quà tặng doanh nghiệp cao cấp, tỉ lệ dọc 4:5, bình sứ Bát Tràng sang trọng đựng rượu truyền thống, hộp quà tinh tế, ánh sáng studio mềm, nền sạch cao cấp, không chữ, không logo, không watermark.",
    hasImage: true,
    icon: ImageIcon,
  },
  // Trust điểm mạnh
  "home.trust.point1_title": {
    label: "Điểm mạnh 1 — Tiêu đề",
    hint: "Ví dụ: '100% Thảo dược tự nhiên'",
    icon: Type,
  },
  "home.trust.point1_desc": {
    label: "Điểm mạnh 1 — Mô tả",
    hint: "Mô tả ngắn 1-2 dòng",
    long: true,
    icon: Type,
  },
  "home.trust.point2_title": {
    label: "Điểm mạnh 2 — Tiêu đề",
    hint: "Ví dụ: 'Chứng nhận chất lượng'",
    icon: Type,
  },
  "home.trust.point2_desc": {
    label: "Điểm mạnh 2 — Mô tả",
    hint: "Mô tả ngắn 1-2 dòng",
    long: true,
    icon: Type,
  },
  "home.trust.point3_title": {
    label: "Điểm mạnh 3 — Tiêu đề",
    hint: "Ví dụ: '10.000+ khách tin dùng'",
    icon: Type,
  },
  "home.trust.point3_desc": {
    label: "Điểm mạnh 3 — Mô tả",
    hint: "Mô tả ngắn 1-2 dòng",
    long: true,
    icon: Type,
  },
  "home.trust.point4_title": {
    label: "Điểm mạnh 4 — Tiêu đề",
    hint: "Ví dụ: 'Tư vấn miễn phí 24/7'",
    icon: Type,
  },
  "home.trust.point4_desc": {
    label: "Điểm mạnh 4 — Mô tả",
    hint: "Mô tả ngắn 1-2 dòng",
    long: true,
    icon: Type,
  },
  // Products
  "home.products.label": {
    label: "Nhãn nhỏ phía trên tiêu đề",
    hint: "Ví dụ: 'Rượu Truyền Thống'",
    icon: Tag,
  },
  "home.products.title": {
    label: "Tiêu đề chính",
    hint: "Ví dụ: 'Dòng Sản Phẩm Cao Cấp'",
    icon: Type,
  },
  "home.products.subtitle": {
    label: "Mô tả dưới tiêu đề",
    hint: "Ví dụ: 'Rượu truyền thống đạt tiêu chuẩn ISO 22000:2018 và OCOP 4 sao'",
    icon: Type,
  },
};

type TabMeta = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  groupPrefix: string;
};

const TABS: TabMeta[] = [
  {
    id: "hero",
    label: "Banner đầu trang",
    shortLabel: "Banner",
    description: "Phần lớn nhất khi khách vừa vào website — tiêu đề + nút bấm trên cùng.",
    icon: Home,
    groupPrefix: "home.hero.",
  },
  {
    id: "trust",
    label: "Tại sao chọn chúng tôi",
    shortLabel: "Tại sao",
    description: "Tiêu đề, 2 cards giới thiệu (ảnh + chữ) và 4 điểm mạnh dưới cùng.",
    icon: ShieldCheck,
    groupPrefix: "home.trust.",
  },
  {
    id: "products",
    label: "Dòng sản phẩm cao cấp",
    shortLabel: "Sản phẩm",
    description: "Tiêu đề và mô tả phía trên danh sách sản phẩm nổi bật.",
    icon: Package,
    groupPrefix: "home.products.",
  },
  {
    id: "cta",
    label: "Khối kêu gọi cuối trang",
    shortLabel: "CTA",
    description: "Khối kêu gọi mua hàng đặt phía cuối trang chủ, ngay trước phần liên hệ.",
    icon: MessageSquare,
    groupPrefix: "home.cta.",
  },
];

export function SectionsClient({ keys, initialValues }: Props) {
  const [values, setValues] = useState<Record<string, Value>>(() => {
    const map: Record<string, Value> = {};
    for (const k of keys) {
      const initial = initialValues[k] ?? { text: "", image: null };
      const defaultValue = DEFAULT_VALUES[k];
      map[k] =
        defaultValue && !initial.text && !initial.image
          ? { ...defaultValue }
          : initial;
    }
    return map;
  });
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const activeTabMeta = TABS.find((t) => t.id === activeTab) ?? TABS[0];
  const activeKeys = keys.filter((k) => k.startsWith(activeTabMeta.groupPrefix));

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 -mx-4 -mt-4 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:-mx-6 sm:-mt-6 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">Nội dung trang chủ</h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Chọn khối bên dưới để chỉnh sửa. Nhấn <strong>Lưu tất cả</strong> để áp dụng cho cả 4 khối.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#8B1A1A] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#6f1414] disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu tất cả"}
          </button>
        </div>
        {message && (
          <div
            className={`mt-2 rounded-md px-3 py-1.5 text-sm ${
              message.type === "ok"
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1.5">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white text-[#8B1A1A] shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:bg-white/60"
              }`}
            >
              <TabIcon size={16} className={isActive ? "text-[#8B1A1A]" : "text-slate-400"} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Active tab content */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="flex items-start gap-3 border-b border-slate-200 bg-gradient-to-br from-amber-50/60 to-white px-4 py-3 sm:px-6">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#8B1A1A]/10 text-[#8B1A1A]">
            <activeTabMeta.icon size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900">{activeTabMeta.label}</h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{activeTabMeta.description}</p>
          </div>
        </header>

        <div className="divide-y divide-slate-100">
          {activeKeys.map((key) => {
            const v = values[key] ?? { text: "", image: null };
            const fieldMeta = FIELD_META[key];
            const FieldIcon = fieldMeta?.icon ?? Type;
            const isLong = fieldMeta?.long ?? false;
            const showImage = fieldMeta?.hasImage ?? false;
            const isUploading = uploadingKey === key;

            return (
              <div key={key} className="px-4 py-4 sm:px-6">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <FieldIcon size={15} className="mt-0.5 flex-shrink-0 text-slate-400" />
                    <div>
                      <label htmlFor={`sec-${key}`} className="block text-sm font-medium text-slate-900">
                        {fieldMeta?.label ?? key}
                      </label>
                      {fieldMeta?.hint && (
                        <p className="mt-0.5 text-xs text-slate-500">{fieldMeta.hint}</p>
                      )}
                    </div>
                  </div>
                  {(v.text || v.image) && (
                    <button
                      type="button"
                      onClick={() => clearField(key)}
                      className="text-xs text-slate-400 hover:text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                {showImage ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="relative h-28 w-40 flex-shrink-0 overflow-hidden rounded-lg border bg-slate-50">
                      {v.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          <ImageIcon size={22} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
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
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[key]?.click()}
                          disabled={isUploading}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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
                      <p className="text-xs text-slate-400">JPG, PNG hoặc WebP — tối đa 3MB</p>
                      {fieldMeta?.imagePrompt ? (
                        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                          <p className="font-semibold">Prompt tạo ảnh GPT</p>
                          <p className="mt-1">{fieldMeta.imagePrompt}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : isLong ? (
                  <textarea
                    id={`sec-${key}`}
                    value={v.text}
                    onChange={(e) => updateText(key, e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]"
                    placeholder="Để trống nếu không muốn hiển thị"
                  />
                ) : (
                  <input
                    id={`sec-${key}`}
                    type="text"
                    value={v.text}
                    onChange={(e) => updateText(key, e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]"
                    placeholder="Để trống nếu không muốn hiển thị"
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer save button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#8B1A1A] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#6f1414] disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu tất cả"}
        </button>
      </div>
    </form>
  );
}
