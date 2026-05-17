"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Save,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import { HERO_COLOR_PRESETS, parseCustomHeroColor } from "@/lib/hero-colors";
import { HeroColorPicker } from "@/components/admin/hero-color-picker";

type Props = {
  slug: string;
  pageTitle: string;
  pageDescription: string;
  previewHref: string;
  defaultBadge: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultColor: string;
};

type FormState = {
  badge: string;
  title: string;
  subtitle: string;
  color: string;
};

type SectionValue = { text: string; image: string | null };

export function HeroSettingsClient({
  slug,
  pageTitle,
  pageDescription,
  previewHref,
  defaultBadge,
  defaultTitle,
  defaultSubtitle,
  defaultColor,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<FormState>({
    badge: "",
    title: "",
    subtitle: "",
    color: defaultColor,
  });

  const badgeKey = `${slug}.hero.badge`;
  const titleKey = `${slug}.hero.title`;
  const subtitleKey = `${slug}.hero.subtitle`;
  const colorKey = `${slug}.hero.color`;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/sections");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const values = data.values as Record<string, SectionValue> | undefined;
        const savedColor = values?.[colorKey]?.text?.trim();
        const isPreset = savedColor && HERO_COLOR_PRESETS.some((p) => p.id === savedColor);
        const isCustom = savedColor ? parseCustomHeroColor(savedColor) !== null : false;
        const validColor = savedColor && (isPreset || isCustom) ? savedColor : defaultColor;
        setForm({
          badge: values?.[badgeKey]?.text ?? "",
          title: values?.[titleKey]?.text ?? "",
          subtitle: values?.[subtitleKey]?.text ?? "",
          color: validColor,
        });
      } catch (err) {
        console.error("[hero-settings load]", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [badgeKey, titleKey, subtitleKey, colorKey, defaultColor]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    const payload = {
      [badgeKey]: { text: form.badge, image: null },
      [titleKey]: { text: form.title, image: null },
      [subtitleKey]: { text: form.subtitle, image: null },
      [colorKey]: { text: form.color, image: null },
    };

    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Lưu thất bại");
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("[hero-settings save]", err);
      setError("Không kết nối được tới server");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-12 text-sm text-gray-400">
        <Loader2 size={16} className="mr-2 animate-spin" /> Đang tải...
      </div>
    );
  }

  const customColor = parseCustomHeroColor(form.color);
  const heroClass = customColor
    ? ""
    : HERO_COLOR_PRESETS.find((p) => p.id === form.color)?.className ||
      "bg-gradient-to-br from-[#003b7a] to-[#2b6cb0]";
  const heroStyle = customColor
    ? { backgroundImage: `linear-gradient(135deg, ${customColor[0]}, ${customColor[1]})` }
    : undefined;

  return (
    <form onSubmit={save} className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="mt-0.5 text-xs text-gray-500">{pageDescription}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink size={13} /> Xem trang thật
          </a>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-[#8B1A1A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6f1414] disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
          <span>Đã lưu thành công! Banner đã cập nhật trên website.</span>
        </div>
      )}

      {/* Hero block */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#8B1A1A]" />
            <h2 className="text-sm font-bold text-gray-900">Banner đầu trang</h2>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Nhãn nhỏ phía trên (badge)
            </label>
            <input
              type="text"
              value={form.badge}
              onChange={(e) => setForm((c) => ({ ...c, badge: e.target.value }))}
              placeholder={defaultBadge}
              maxLength={80}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Tiêu đề lớn
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
              placeholder={defaultTitle}
              maxLength={140}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Mô tả ngắn dưới tiêu đề
            </label>
            <textarea
              value={form.subtitle}
              onChange={(e) => setForm((c) => ({ ...c, subtitle: e.target.value }))}
              placeholder={defaultSubtitle}
              rows={2}
              maxLength={300}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/30"
            />
          </div>

          {/* Color picker — presets + custom */}
          <HeroColorPicker
            value={form.color}
            onChange={(v) => setForm((c) => ({ ...c, color: v }))}
          />

          {/* Live preview */}
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-700">Xem trước</p>
            <div className="overflow-hidden rounded-lg">
              <div className={`${heroClass} px-4 py-6 text-center`} style={heroStyle}>
                {(form.badge || defaultBadge) ? (
                  <p className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37] ring-1 ring-white/20">
                    {form.badge || defaultBadge}
                  </p>
                ) : null}
                <h3 className="text-lg font-bold leading-tight text-white sm:text-xl">
                  {form.title || defaultTitle}
                </h3>
                {(form.subtitle || defaultSubtitle) ? (
                  <p className="mx-auto mt-1.5 max-w-md text-xs text-white/85">
                    {form.subtitle || defaultSubtitle}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hint */}
      <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
        <p className="mb-2 text-xs font-bold text-blue-900">💡 Lưu ý</p>
        <ul className="ml-4 list-disc space-y-1 text-xs text-blue-800">
          <li>Bỏ trống bất kỳ field nào để dùng giá trị mặc định.</li>
          <li>Nội dung bài viết của trang Tin tức được quản lý ở mục <strong>Bài viết</strong>.</li>
        </ul>
      </section>
    </form>
  );
}
