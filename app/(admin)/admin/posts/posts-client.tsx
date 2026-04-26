"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Table, THead, TR, TH, TD } from "@/components/admin/table";
import { Button, Field, Input, Textarea } from "@/components/admin/form";
import { slugify } from "@/lib/slug";

type Post = {
  id: number;
  title: string;
  slug: string;
  content: string;
  image: string | null;
  isPublished: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
};

type FormState = {
  title: string;
  slug: string;
  slugTouched: boolean;
  content: string;
  image: string;
  isPublished: boolean;
  metaTitle: string;
  metaDescription: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  slugTouched: false,
  content: "",
  image: "",
  isPublished: true,
  metaTitle: "",
  metaDescription: "",
};

export function PostsClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (err) {
      console.error("[admin posts load]", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setViewMode("edit");
    setShowForm(true);
    setError(null);
  }

  function openEdit(p: Post) {
    setForm({
      title: p.title,
      slug: p.slug,
      slugTouched: true,
      content: p.content,
      image: p.image || "",
      isPublished: p.isPublished,
      metaTitle: p.metaTitle || "",
      metaDescription: p.metaDescription || "",
    });
    setEditingId(p.id);
    setViewMode("edit");
    setShowForm(true);
    setError(null);
  }

  function updateTitle(title: string) {
    setForm((current) => ({
      ...current,
      title,
      slug: current.slugTouched ? current.slug : slugify(title),
    }));
  }

  function updateSlug(slug: string) {
    setForm((current) => ({
      ...current,
      slug,
      slugTouched: true,
    }));
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
        setError(data.error || "Upload ảnh thất bại");
        return;
      }
      const data = await res.json();
      if (data.url) setForm((current) => ({ ...current, image: data.url }));
    } catch (err) {
      console.error("[admin posts upload]", err);
      setError("Không kết nối được tới server");
    } finally {
      setUploadingImage(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      title: form.title,
      slug: form.slug,
      content: form.content,
      image: form.image || null,
      isPublished: form.isPublished,
      metaTitle: form.metaTitle || null,
      metaDescription: form.metaDescription || null,
    };
    const url = editingId ? `/api/admin/posts/${editingId}` : "/api/admin/posts";
    const method = editingId ? "PATCH" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Lưu thất bại");
        return;
      }
      setShowForm(false);
      await load();
    } catch (err) {
      console.error("[admin posts save]", err);
      setError("Không kết nối được tới server");
    }
  }

  async function togglePublish(p: Post) {
    try {
      await fetch(`/api/admin/posts/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !p.isPublished }),
      });
      await load();
    } catch (err) {
      console.error("[admin posts togglePublish]", err);
    }
  }

  async function remove(id: number) {
    if (!confirm("Xóa bài viết này?")) return;
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (res.ok) await load();
    } catch (err) {
      console.error("[admin posts remove]", err);
    }
  }

  const previewSrcDoc = useMemo(() => {
    const safe = form.content || "<p><em>(Chưa có nội dung)</em></p>";
    return `<!doctype html><html><head><meta charset="utf-8" /><style>body{font-family:ui-sans-serif,system-ui,sans-serif;max-width:720px;margin:20px auto;padding:0 16px;line-height:1.6;color:#111827}h1,h2,h3,h4{margin-top:1.6em}img{max-width:100%;height:auto;border-radius:8px}a{color:#1d4ed8}</style></head><body>${safe}</body></html>`;
  }, [form.content]);

  return (
    <div>
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl">Tin tức / Blog</h1>
        <Button onClick={openCreate}>+ Thêm bài viết</Button>
      </div>

      {showForm && (
        <form onSubmit={save} className="mb-6 space-y-4 rounded border bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-medium">{editingId ? "Sửa bài viết" : "Thêm bài viết"}</h2>
            <div className="inline-flex rounded-lg border bg-gray-50 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className={`rounded-md px-3 py-1 font-semibold ${
                  viewMode === "edit" ? "bg-white text-gray-900 shadow" : "text-gray-500"
                }`}
              >
                Soạn thảo
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`rounded-md px-3 py-1 font-semibold ${
                  viewMode === "preview" ? "bg-white text-gray-900 shadow" : "text-gray-500"
                }`}
              >
                Xem trước
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Tiêu đề">
              <Input value={form.title} onChange={(e) => updateTitle(e.target.value)} required />
            </Field>
            <Field label="Slug (tự sinh từ tiêu đề)">
              <Input value={form.slug} onChange={(e) => updateSlug(e.target.value)} required />
            </Field>
          </div>

          {viewMode === "edit" ? (
            <Field label="Nội dung (HTML)">
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={14}
                placeholder="<h2>Tiêu đề phụ</h2><p>Nội dung bài viết...</p>"
                required
              />
            </Field>
          ) : (
            <div className="overflow-hidden rounded border">
              <iframe
                title="Preview"
                srcDoc={previewSrcDoc}
                className="block h-[520px] w-full bg-white"
                sandbox=""
              />
            </div>
          )}

          <div className="space-y-2 rounded border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <p className="text-sm font-medium text-slate-700">Ảnh đại diện</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="h-32 w-48 flex-shrink-0 overflow-hidden rounded border bg-white">
                {form.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image} alt="Ảnh đại diện" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    Chưa có ảnh
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
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
                  {uploadingImage ? "Đang tải lên..." : form.image ? "Đổi ảnh" : "Tải ảnh lên"}
                </Button>
                {form.image && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: "" })}
                    className="text-left text-xs text-red-600 hover:underline"
                  >
                    Gỡ ảnh
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Meta Title (SEO)">
              <Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
            </Field>
            <Field label="Meta Description (SEO)">
              <Input
                value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            />
            Xuất bản
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Lưu</Button>
            {editingId && form.slug ? (
              <a
                href={`/news/${form.slug}?preview=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Xem trước trên trang
              </a>
            ) : null}
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Hủy
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải...</p>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-sm font-medium text-gray-700">Chưa có bài viết nào.</p>
          <p className="mt-1 text-xs text-gray-500">Bấm "+ Thêm bài viết" để tạo bài đầu tiên.</p>
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Tiêu đề</TH>
              <TH>Slug</TH>
              <TH>Trạng thái</TH>
              <TH>Ngày tạo</TH>
              <TH className="text-right">Hành động</TH>
            </TR>
          </THead>
          <tbody>
            {posts.map((p) => (
              <TR key={p.id}>
                <TD>{p.title}</TD>
                <TD className="font-mono text-xs">/news/{p.slug}</TD>
                <TD>
                  <button
                    onClick={() => togglePublish(p)}
                    className={`text-xs px-2 py-1 rounded ${
                      p.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {p.isPublished ? "Đã xuất bản" : "Nháp"}
                  </button>
                </TD>
                <TD className="text-xs text-gray-500">
                  {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                </TD>
                <TD className="text-right space-x-2">
                  <a
                    href={`/news/${p.slug}${p.isPublished ? "" : "?preview=true"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Xem
                  </a>
                  <button onClick={() => openEdit(p)} className="text-sm text-[#8B1A1A] hover:underline">
                    Sửa
                  </button>
                  <button onClick={() => remove(p.id)} className="text-sm text-red-600 hover:underline">
                    Xóa
                  </button>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
