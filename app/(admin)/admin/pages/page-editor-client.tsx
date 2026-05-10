"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Field, Input } from "@/components/admin/form";
import { AdminCard, AdminPageHeader } from "@/components/admin/ui";

const TiptapEditor = dynamic(
  () => import("@/components/admin/tiptap-editor").then((m) => m.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-lg border bg-gray-50 text-sm text-gray-400">
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
    return `<!doctype html><html><head><meta charset="utf-8" /><style>body{font-family:ui-sans-serif,system-ui,sans-serif;max-width:720px;margin:20px auto;padding:0 16px;line-height:1.65;color:#111827}h1,h2,h3,h4{margin-top:1.6em;line-height:1.3}img{max-width:100%;height:auto;border-radius:8px}a{color:#1d4ed8}</style></head><body>${safe}</body></html>`;
  }, [form.content]);

  if (loading) {
    return (
      <AdminCard>
        <p className="text-sm text-gray-500">Đang tải...</p>
      </AdminCard>
    );
  }

  return (
    <>
      <AdminPageHeader
        title={pageTitle}
        description={pageDescription}
        actions={
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Xem trang
          </a>
        }
      />

      <AdminCard title="Nội dung trang">
        <form onSubmit={save} className="space-y-5">
          <Field label="Tiêu đề trang">
            <Input
              value={form.title}
              onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
              required
            />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-700">Nội dung</span>
              <div className="inline-flex rounded-lg border bg-gray-50 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("edit")}
                  className={`rounded-md px-3 py-1 font-semibold ${
                    viewMode === "edit"
                      ? "bg-white text-gray-900 shadow"
                      : "text-gray-500"
                  }`}
                >
                  Soạn thảo
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={`rounded-md px-3 py-1 font-semibold ${
                    viewMode === "preview"
                      ? "bg-white text-gray-900 shadow"
                      : "text-gray-500"
                  }`}
                >
                  Xem trước
                </button>
              </div>
            </div>

            {viewMode === "edit" ? (
              <TiptapEditor
                value={form.content}
                onChange={(html) => setForm((c) => ({ ...c, content: html }))}
                placeholder="Nhập nội dung trang tại đây..."
              />
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <iframe
                  title="Preview"
                  srcDoc={previewSrcDoc}
                  className="block h-[520px] w-full bg-white"
                  sandbox=""
                />
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <p className="text-sm font-medium text-slate-700">Thêm ảnh vào nội dung</p>
            <div className="flex items-center gap-3">
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
              <Button
                type="button"
                variant="ghost"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? "Đang tải lên..." : "Tải ảnh lên"}
              </Button>
              <span className="text-xs text-gray-400">Ảnh sẽ được chèn vào cuối nội dung</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4 space-y-3">
            <p className="text-sm font-medium text-slate-700">SEO</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Meta Title">
                <Input
                  value={form.metaTitle}
                  onChange={(e) => setForm((c) => ({ ...c, metaTitle: e.target.value }))}
                  placeholder="Để trống sẽ dùng tiêu đề trang"
                />
              </Field>
              <Field label="Meta Description">
                <Input
                  value={form.metaDescription}
                  onChange={(e) => setForm((c) => ({ ...c, metaDescription: e.target.value }))}
                  placeholder="Mô tả ngắn cho Google"
                />
              </Field>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((c) => ({ ...c, isPublished: e.target.checked }))}
            />
            Xuất bản (hiện trên website)
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && (
            <p className="text-sm text-green-600">Đã lưu thành công!</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </AdminCard>
    </>
  );
}
