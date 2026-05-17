"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  CheckCircle2,
  AlertCircle,
  Save,
  Eye,
  Pencil,
  ImagePlus,
  ExternalLink,
  Globe,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  HERO_COLOR_PRESETS,
  DEFAULT_HERO_COLOR,
  parseCustomHeroColor,
} from "@/lib/hero-colors";
import { HeroColorPicker } from "@/components/admin/hero-color-picker";

const TiptapEditor = dynamic(
  () => import("@/components/admin/tiptap-editor").then((m) => m.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] items-center justify-center rounded-lg border bg-gray-50 text-sm text-gray-400">
        Đang tải trình soạn thảo...
      </div>
    ),
  }
);

type Page = {
  id: number;
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
};

type Props = {
  slug: string;
  pageTitle: string;
  pageDescription: string;
  previewHref: string;
};

type FormState = {
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  heroBadge: string;
  heroSubtitle: string;
  heroColor: string;
  contactMapEmbed: string;
  contactCards: {
    phone: ContactCardForm;
    zalo: ContactCardForm;
    email: ContactCardForm;
  };
};

type SectionValue = { text: string; image: string | null };
type ContactCardId = "phone" | "zalo" | "email";
type ContactCardForm = {
  label: string;
  value: string;
  sub: string;
  href: string;
  cta: string;
};

const EMPTY_CONTACT_CARDS: Record<ContactCardId, ContactCardForm> = {
  phone: { label: "", value: "", sub: "", href: "", cta: "" },
  zalo: { label: "", value: "", sub: "", href: "", cta: "" },
  email: { label: "", value: "", sub: "", href: "", cta: "" },
};

const CONTACT_CARD_META: Array<{ id: ContactCardId; title: string }> = [
  { id: "phone", title: "Card Hotline" },
  { id: "zalo", title: "Card Zalo" },
  { id: "email", title: "Card Email" },
];

export function PageEditorClient({ slug, pageTitle, pageDescription, previewHref }: Props) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    title: pageTitle,
    content: "",
    metaTitle: "",
    metaDescription: "",
    heroBadge: "",
    heroSubtitle: "",
    heroColor: DEFAULT_HERO_COLOR[slug] || "blue",
    contactMapEmbed: "",
    contactCards: EMPTY_CONTACT_CARDS,
  });

  const heroBadgeKey = `${slug}.hero.badge`;
  const heroSubtitleKey = `${slug}.hero.subtitle`;
  const heroColorKey = `${slug}.hero.color`;
  const contactMapEmbedKey = "lien-he.map.embed";
  const contactCardKey = (id: ContactCardId, field: keyof ContactCardForm) =>
    `lien-he.contact.${id}.${field}`;

  async function load() {
    setLoading(true);
    try {
      const [pagesRes, sectionsRes] = await Promise.all([
        fetch("/api/admin/pages"),
        fetch("/api/admin/sections"),
      ]);

      let foundPage: Page | null = null;
      if (pagesRes.ok) {
        const data = await pagesRes.json();
        foundPage = (data.pages as Page[]).find((p) => p.slug === slug) ?? null;
        if (foundPage) setPage(foundPage);
      }

      let heroBadge = "";
      let heroSubtitle = "";
      let heroColor = DEFAULT_HERO_COLOR[slug] || "blue";
      let contactMapEmbed = "";
      let contactCards = EMPTY_CONTACT_CARDS;
      if (sectionsRes.ok) {
        const data = await sectionsRes.json();
        const values = data.values as Record<string, SectionValue> | undefined;
        heroBadge = values?.[heroBadgeKey]?.text ?? "";
        heroSubtitle = values?.[heroSubtitleKey]?.text ?? "";
        contactMapEmbed = values?.[contactMapEmbedKey]?.text ?? "";
        const savedColor = values?.[heroColorKey]?.text?.trim();
        if (savedColor) {
          const isPreset = HERO_COLOR_PRESETS.some((p) => p.id === savedColor);
          const isCustom = parseCustomHeroColor(savedColor) !== null;
          if (isPreset || isCustom) {
            heroColor = savedColor;
          }
        }
        contactCards = {
          phone: {
            label: values?.[contactCardKey("phone", "label")]?.text ?? "",
            value: values?.[contactCardKey("phone", "value")]?.text ?? "",
            sub: values?.[contactCardKey("phone", "sub")]?.text ?? "",
            href: values?.[contactCardKey("phone", "href")]?.text ?? "",
            cta: values?.[contactCardKey("phone", "cta")]?.text ?? "",
          },
          zalo: {
            label: values?.[contactCardKey("zalo", "label")]?.text ?? "",
            value: values?.[contactCardKey("zalo", "value")]?.text ?? "",
            sub: values?.[contactCardKey("zalo", "sub")]?.text ?? "",
            href: values?.[contactCardKey("zalo", "href")]?.text ?? "",
            cta: values?.[contactCardKey("zalo", "cta")]?.text ?? "",
          },
          email: {
            label: values?.[contactCardKey("email", "label")]?.text ?? "",
            value: values?.[contactCardKey("email", "value")]?.text ?? "",
            sub: values?.[contactCardKey("email", "sub")]?.text ?? "",
            href: values?.[contactCardKey("email", "href")]?.text ?? "",
            cta: values?.[contactCardKey("email", "cta")]?.text ?? "",
          },
        };
      }

      setForm({
        title: foundPage?.title ?? pageTitle,
        content: foundPage?.content ?? "",
        metaTitle: foundPage?.metaTitle || "",
        metaDescription: foundPage?.metaDescription || "",
        heroBadge,
        heroSubtitle,
        heroColor,
        contactMapEmbed,
        contactCards,
      });
    } catch (err) {
      console.error("[page-editor load]", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!form.title.trim()) {
      setError("Vui lòng nhập tiêu đề trang");
      return;
    }
    setSaving(true);

    const payload = {
      slug,
      title: form.title,
      content: form.content,
      isPublished: true,
      metaTitle: form.metaTitle || null,
      metaDescription: form.metaDescription || null,
    };

    const sectionsPayload: Record<string, SectionValue> = {
      [heroBadgeKey]: { text: form.heroBadge, image: null },
      [heroSubtitleKey]: { text: form.heroSubtitle, image: null },
      [heroColorKey]: { text: form.heroColor, image: null },
    };
    if (slug === "lien-he") {
      sectionsPayload[contactMapEmbedKey] = { text: form.contactMapEmbed, image: null };
      for (const id of ["phone", "zalo", "email"] as ContactCardId[]) {
        const card = form.contactCards[id];
        sectionsPayload[contactCardKey(id, "label")] = { text: card.label, image: null };
        sectionsPayload[contactCardKey(id, "value")] = { text: card.value, image: null };
        sectionsPayload[contactCardKey(id, "sub")] = { text: card.sub, image: null };
        sectionsPayload[contactCardKey(id, "href")] = { text: card.href, image: null };
        sectionsPayload[contactCardKey(id, "cta")] = { text: card.cta, image: null };
      }
    }

    try {
      let pageRes: Response;
      if (page) {
        pageRes = await fetch(`/api/admin/pages/${page.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        pageRes = await fetch("/api/admin/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!pageRes.ok) {
        const data = await pageRes.json().catch(() => ({}));
        setError(data.error || "Lưu thất bại");
        return;
      }
      const savedPage = await pageRes.json();
      setPage(savedPage);

      const sectionsRes = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sectionsPayload),
      });
      if (!sectionsRes.ok) {
        const data = await sectionsRes.json().catch(() => ({}));
        setError(data.error || "Lưu phần banner thất bại");
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("[page-editor save]", err);
      setError("Không kết nối được tới server");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File) {
    setUploadingImage(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "section");
      const res = await fetch("/api/media", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Tải ảnh thất bại");
        return;
      }
      const data = await res.json();
      if (data.url) {
        const imgTag = `<img src="${data.url}" alt="" />`;
        setForm((c) => ({ ...c, content: c.content + imgTag }));
      }
    } catch (err) {
      console.error("[page-editor upload]", err);
      setError("Không kết nối được tới server");
    } finally {
      setUploadingImage(false);
    }
  }

  const previewSrcDoc = useMemo(() => {
    const safe = form.content || "<p><em>(Chưa có nội dung)</em></p>";
    return `<!doctype html><html><head><meta charset="utf-8" /><style>body{font-family:ui-sans-serif,system-ui,sans-serif;max-width:720px;margin:20px auto;padding:0 16px;line-height:1.65;color:#111827}h1,h2,h3,h4{margin-top:1.6em;line-height:1.3}img{max-width:100%;height:auto;border-radius:8px;display:block;margin:1em auto}a{color:#1d4ed8}table{border-collapse:collapse;width:100%;margin:1em 0}th,td{border:1px solid #e5e7eb;padding:8px}th{background:#f9fafb}blockquote{border-left:4px solid #8B1A1A;background:#fffbeb;padding:8px 16px;margin:1em 0}</style></head><body>${safe}</body></html>`;
  }, [form.content]);

  const charCount = form.content.replace(/<[^>]+>/g, "").length;
  const wordCount = form.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-12 text-sm text-gray-400">
        <Loader2 size={16} className="mr-2 animate-spin" /> Đang tải trang...
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-4">
      {/* Top header bar */}
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

      {/* Status alerts */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
          <span>Đã lưu thành công! Nội dung đã cập nhật trên website.</span>
        </div>
      )}

      {/* 2-column layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* LEFT — content (2/3) */}
        <div className="space-y-4 lg:col-span-2">
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-bold text-gray-900">Nội dung trang</h2>
              <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("edit")}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    viewMode === "edit" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Pencil size={11} /> Soạn thảo
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    viewMode === "preview" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Eye size={11} /> Xem trước
                </button>
              </div>
            </div>

            <div className="space-y-4 p-4">
              {/* Hero banner block — title, badge, subtitle */}
              <div className="space-y-3 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-white p-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#8B1A1A]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B1A1A]">
                    Banner đầu trang
                  </h3>
                </div>
                <p className="text-xs text-gray-500">
                  3 dòng chữ hiển thị trên cùng (banner gradient). Bỏ trống nếu không muốn hiển thị.
                </p>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Nhãn nhỏ phía trên (badge)
                  </label>
                  <input
                    type="text"
                    value={form.heroBadge}
                    onChange={(e) => setForm((c) => ({ ...c, heroBadge: e.target.value }))}
                    placeholder="Ví dụ: Câu chuyện thương hiệu"
                    maxLength={80}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/30"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Tiêu đề lớn (dùng làm Tiêu đề trang) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
                    required
                    placeholder="Ví dụ: Rượu truyền thống là gì?"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/30"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Mô tả ngắn dưới tiêu đề
                  </label>
                  <textarea
                    value={form.heroSubtitle}
                    onChange={(e) => setForm((c) => ({ ...c, heroSubtitle: e.target.value }))}
                    placeholder="Câu giới thiệu 1-2 dòng hiển thị dưới tiêu đề banner"
                    rows={2}
                    maxLength={300}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/30"
                  />
                </div>

                {/* Hero color picker (presets + custom) */}
                <HeroColorPicker
                  value={form.heroColor}
                  onChange={(v) => setForm((c) => ({ ...c, heroColor: v }))}
                />

                {/* Live preview */}
                <HeroPreview
                  color={form.heroColor}
                  badge={form.heroBadge}
                  title={form.title}
                  subtitle={form.heroSubtitle}
                />
              </div>

              {slug === "lien-he" ? (
                <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/60 p-4">
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-sky-700" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-900">
                      Bản đồ Google Maps
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Dán mã iframe nhúng từ Google Maps. Bản đồ sẽ hiển thị ở trang /lien-he.
                  </p>
                  <textarea
                    value={form.contactMapEmbed}
                    onChange={(e) => setForm((c) => ({ ...c, contactMapEmbed: e.target.value }))}
                    rows={5}
                    placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
                    className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
                  />
                  {form.contactMapEmbed.trim() ? (
                    <div className="overflow-hidden rounded-xl bg-slate-100 [&_iframe]:block [&_iframe]:h-[260px] [&_iframe]:w-full [&_iframe]:border-0">
                      <div dangerouslySetInnerHTML={{ __html: form.contactMapEmbed }} />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {slug === "lien-he" ? (
                <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-700" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                      3 nút liên hệ nhanh
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Admin có thể sửa toàn bộ chữ và link của 3 card hiển thị dưới banner trang Liên hệ.
                  </p>

                  <div className="grid gap-3 lg:grid-cols-3">
                    {CONTACT_CARD_META.map(({ id, title }) => {
                      const card = form.contactCards[id];
                      const updateCard = (field: keyof ContactCardForm, value: string) => {
                        setForm((current) => ({
                          ...current,
                          contactCards: {
                            ...current.contactCards,
                            [id]: { ...current.contactCards[id], [field]: value },
                          },
                        }));
                      };

                      return (
                        <div key={id} className="rounded-xl border border-emerald-100 bg-white p-3 shadow-sm">
                          <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-emerald-900">
                            {title}
                          </h4>
                          <div className="space-y-2">
                            <input
                              value={card.label}
                              onChange={(e) => updateCard("label", e.target.value)}
                              placeholder="Label"
                              className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-100"
                            />
                            <input
                              value={card.value}
                              onChange={(e) => updateCard("value", e.target.value)}
                              placeholder="Nội dung chính"
                              className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-100"
                            />
                            <input
                              value={card.sub}
                              onChange={(e) => updateCard("sub", e.target.value)}
                              placeholder="Dòng phụ"
                              className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-100"
                            />
                            <input
                              value={card.href}
                              onChange={(e) => updateCard("href", e.target.value)}
                              placeholder="Link: tel:, mailto:, https://..."
                              className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-100"
                            />
                            <input
                              value={card.cta}
                              onChange={(e) => updateCard("cta", e.target.value)}
                              placeholder="Nút CTA"
                              className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-100"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {viewMode === "edit" ? (
                <TiptapEditor
                  value={form.content}
                  onChange={(html) => setForm((c) => ({ ...c, content: html }))}
                  placeholder="Nhập nội dung trang tại đây..."
                  className="min-h-[480px]"
                />
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <iframe
                    title="Preview"
                    srcDoc={previewSrcDoc}
                    className="block h-[640px] w-full bg-white"
                    sandbox=""
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs text-gray-400">
                <span>
                  {wordCount} từ · {charCount} ký tự
                </span>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file);
                    e.currentTarget.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 font-medium text-gray-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"
                >
                  <ImagePlus size={12} />
                  {uploadingImage ? "Đang tải..." : "Chèn ảnh vào cuối nội dung"}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT — sidebar (1/3) */}
        <div className="space-y-4">
          {/* Page info */}
          {page && (
            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-bold text-gray-900">Thông tin trang</h2>
              </div>
              <div className="space-y-2 p-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <span className="font-medium text-green-700">Đang hiển thị trên website</span>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2 text-gray-500">
                  <p>Slug: <code className="text-gray-700">{slug}</code></p>
                  <p className="mt-1">ID: #{page.id}</p>
                </div>
              </div>
            </section>
          )}

          {/* SEO */}
          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
              <Globe size={14} className="text-gray-500" />
              <h2 className="text-sm font-bold text-gray-900">SEO</h2>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Meta Title</label>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={(e) => setForm((c) => ({ ...c, metaTitle: e.target.value }))}
                  placeholder="Để trống sẽ dùng tiêu đề trang"
                  maxLength={70}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/30"
                />
                <p className="mt-1 flex justify-between text-[11px] text-gray-400">
                  <span>Tiêu đề Google sẽ hiển thị</span>
                  <span className={form.metaTitle.length > 60 ? "text-amber-600" : ""}>
                    {form.metaTitle.length}/70
                  </span>
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Meta Description</label>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) => setForm((c) => ({ ...c, metaDescription: e.target.value }))}
                  placeholder="Mô tả ngắn cho Google"
                  rows={3}
                  maxLength={170}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/30"
                />
                <p className="mt-1 flex justify-between text-[11px] text-gray-400">
                  <span>Hiển thị dưới tiêu đề trên Google</span>
                  <span className={form.metaDescription.length > 160 ? "text-amber-600" : ""}>
                    {form.metaDescription.length}/170
                  </span>
                </p>
              </div>

              {/* Google preview */}
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  Xem trước trên Google
                </p>
                <p className="truncate text-sm font-medium text-blue-700">
                  {form.metaTitle || form.title || "(Chưa có tiêu đề)"}
                </p>
                <p className="text-[11px] text-green-700">
                  yourdomain.com{previewHref}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                  {form.metaDescription || "(Chưa có mô tả — Google sẽ tự lấy đoạn đầu nội dung)"}
                </p>
              </div>
            </div>
          </section>

          {/* Tip */}
          <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <p className="mb-2 text-xs font-bold text-blue-900">💡 Tip</p>
            <ul className="ml-4 list-disc space-y-1 text-xs text-blue-800">
              <li>Dùng Heading 2/3 cho tiêu đề nhỏ — giúp đọc dễ hơn</li>
              <li>Chèn bảng cho danh sách so sánh sản phẩm</li>
              <li>Toolbar có nút chèn ảnh, link, blockquote sẵn</li>
              <li>Cần code HTML phức tạp? Bấm nút <strong>HTML</strong> trên toolbar</li>
            </ul>
          </section>
        </div>
      </div>
    </form>
  );
}

function HeroPreview({
  color,
  badge,
  title,
  subtitle,
}: {
  color: string;
  badge: string;
  title: string;
  subtitle: string;
}) {
  const custom = parseCustomHeroColor(color);
  const preset = HERO_COLOR_PRESETS.find((p) => p.id === color);
  const style = custom
    ? { backgroundImage: `linear-gradient(135deg, ${custom[0]}, ${custom[1]})` }
    : undefined;
  const className = custom
    ? ""
    : preset?.className || "bg-gradient-to-br from-[#003b7a] to-[#2b6cb0]";

  return (
    <div className="overflow-hidden rounded-lg">
      <div className={`${className} px-4 py-5 text-center`} style={style}>
        {badge ? (
          <p className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37] ring-1 ring-white/20">
            {badge}
          </p>
        ) : null}
        <h3 className="text-base font-bold leading-tight text-white sm:text-lg">
          {title || "(Tiêu đề trang)"}
        </h3>
        {subtitle ? (
          <p className="mx-auto mt-1.5 max-w-md text-[11px] text-white/85 sm:text-xs">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
