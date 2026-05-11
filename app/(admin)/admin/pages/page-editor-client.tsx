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
} from "lucide-react";

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
  isPublished: boolean;
  metaTitle: string;
  metaDescription: string;
};

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
    isPublished: true,
    metaTitle: "",
    metaDescription: "",
  });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pages");
      if (res.ok) {
        const data = await res.json();
        const found = (data.pages as Page[]).find((p) => p.slug === slug);
        if (found) {
          setPage(found);
          setForm({
            title: found.title,
            content: found.content,
            isPublished: found.isPublished,
            metaTitle: found.metaTitle || "",
            metaDescription: found.metaDescription || "",
          });
        }
      }
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
      isPublished: form.isPublished,
      metaTitle: form.metaTitle || null,
      metaDescription: form.metaDescription || null,
    };

    try {
      let res: Response;
      if (page) {
        res = await fetch(`/api/admin/pages/${page.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Lưu thất bại");
        return;
      }
      const saved = await res.json();
      setPage(saved);
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
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Tiêu đề trang <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/30"
                />
              </div>

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
          {/* Publish status */}
          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-bold text-gray-900">Trạng thái xuất bản</h2>
            </div>
            <div className="space-y-3 p-4">
              <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-gray-200 p-3 hover:border-amber-300 hover:bg-amber-50">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm((c) => ({ ...c, isPublished: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Hiển thị trên website</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Bỏ chọn để giữ trạng thái nháp — chỉ admin xem được khi mở qua link preview.
                  </p>
                </div>
              </label>

              {page && (
                <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                  <p>
                    Slug: <code className="text-gray-700">{slug}</code>
                  </p>
                  <p className="mt-1">ID: #{page.id}</p>
                </div>
              )}
            </div>
          </section>

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
