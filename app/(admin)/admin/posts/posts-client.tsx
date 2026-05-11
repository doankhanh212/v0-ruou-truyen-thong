"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Table, THead, TR, TH, TD } from "@/components/admin/table";
import { Button } from "@/components/admin/form";
import { AdminEmpty, AdminPageHeader } from "@/components/admin/ui";
import { slugify } from "@/lib/slug";
import {
  CheckCircle2,
  AlertCircle,
  Save,
  Eye,
  Pencil,
  ImageIcon,
  ExternalLink,
  Globe,
  Loader2,
  X,
  ArrowLeft,
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
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
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
    setSuccess(false);
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
    setSuccess(false);
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
        setError(data.error || "Tải ảnh thất bại");
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
    setSuccess(false);
    if (!form.title.trim() || !form.content.trim()) {
      setError("Vui lòng nhập tiêu đề và nội dung");
      return;
    }
    setSaving(true);
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
      const saved = await res.json();
      // Khi tạo mới → giữ form mở để admin sửa tiếp; khi update → cập nhật ID local
      if (!editingId && saved?.id) {
        setEditingId(saved.id);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await load();
    } catch (err) {
      console.error("[admin posts save]", err);
      setError("Không kết nối được tới server");
    } finally {
      setSaving(false);
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
    if (!confirm("Xoá bài viết này?")) return;
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (res.ok) await load();
    } catch (err) {
      console.error("[admin posts remove]", err);
    }
  }

  const previewSrcDoc = useMemo(() => {
    const safe = form.content || "<p><em>(Chưa có nội dung)</em></p>";
    const heroImg = form.image
      ? `<img src="${form.image}" alt="" style="width:100%;max-height:280px;object-fit:cover;border-radius:12px;margin-bottom:24px"/>`
      : "";
    const title = form.title ? `<h1>${form.title}</h1>` : "";
    return `<!doctype html><html><head><meta charset="utf-8" /><style>body{font-family:ui-sans-serif,system-ui,sans-serif;max-width:720px;margin:20px auto;padding:0 16px;line-height:1.65;color:#111827}h1{margin:0 0 12px;font-size:28px}h2,h3,h4{margin-top:1.6em;line-height:1.3}img{max-width:100%;height:auto;border-radius:8px;display:block;margin:1em auto}a{color:#1d4ed8}table{border-collapse:collapse;width:100%;margin:1em 0}th,td{border:1px solid #e5e7eb;padding:8px}th{background:#f9fafb}blockquote{border-left:4px solid #8B1A1A;background:#fffbeb;padding:8px 16px;margin:1em 0}</style></head><body>${heroImg}${title}${safe}</body></html>`;
  }, [form.content, form.image, form.title]);

  const charCount = form.content.replace(/<[^>]+>/g, "").length;
  const wordCount = form.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;

  // ── EDIT MODE: full-screen 2-column editor ───────────────────────────────
  if (showForm) {
    return (
      <form onSubmit={save} className="space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              title="Quay lại danh sách"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {editingId ? "Sửa bài viết" : "Bài viết mới"}
              </h1>
              <p className="mt-0.5 text-xs text-gray-500">
                {editingId
                  ? `ID #${editingId} — chỉnh sửa nội dung và meta SEO`
                  : "Tạo bài viết mới hiển thị tại trang /news"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {editingId && form.slug && (
              <a
                href={`/news/${form.slug}${form.isPublished ? "" : "?preview=true"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ExternalLink size={13} /> Xem bài
              </a>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-[#8B1A1A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6f1414] disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Tạo bài"}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
            <span>Đã lưu thành công!</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* LEFT — content */}
          <div className="space-y-4 lg:col-span-2">
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-bold text-gray-900">Nội dung bài viết</h2>
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
                    Tiêu đề bài viết <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => updateTitle(e.target.value)}
                    required
                    placeholder="VD: 5 lợi ích sức khoẻ của rượu Ba Kích..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base font-medium focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/30"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Đường dẫn (slug) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1 rounded-lg border border-gray-300 px-2 focus-within:border-[#8B1A1A] focus-within:ring-1 focus-within:ring-[#8B1A1A]/30">
                    <span className="text-xs text-gray-400">/news/</span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => updateSlug(e.target.value)}
                      required
                      className="flex-1 border-0 px-1 py-2 text-sm focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>

                {viewMode === "edit" ? (
                  <TiptapEditor
                    value={form.content}
                    onChange={(html) => setForm((c) => ({ ...c, content: html }))}
                    placeholder="Bắt đầu viết bài..."
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
                  <span>{wordCount} từ · {charCount} ký tự</span>
                  <span className="text-gray-400">~ {Math.max(1, Math.ceil(wordCount / 200))} phút đọc</span>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT — sidebar */}
          <div className="space-y-4">
            {/* Hero image */}
            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                <ImageIcon size={14} className="text-gray-500" />
                <h2 className="text-sm font-bold text-gray-900">Ảnh đại diện</h2>
              </div>
              <div className="space-y-3 p-4">
                <div className="aspect-video overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  {form.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-xs text-gray-400">
                      <ImageIcon size={28} className="mb-2 text-gray-300" />
                      Chưa có ảnh
                    </div>
                  )}
                </div>
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
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md bg-[#8B1A1A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#6f1414] disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 size={12} className="animate-spin" /> Đang tải...
                      </>
                    ) : form.image ? (
                      "Đổi ảnh"
                    ) : (
                      "Tải ảnh lên"
                    )}
                  </button>
                  {form.image && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: "" })}
                      className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      <X size={11} /> Gỡ
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">
                  Khuyến nghị: 1200×675 px (16:9). Hiển thị ở đầu bài và trong list /news.
                </p>
              </div>
            </section>

            {/* Publish */}
            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-bold text-gray-900">Xuất bản</h2>
              </div>
              <div className="p-4">
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-gray-200 p-3 hover:border-amber-300 hover:bg-amber-50">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Xuất bản công khai</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Bỏ chọn để giữ nháp — chỉ admin xem được qua link preview.
                    </p>
                  </div>
                </label>
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
                    onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                    placeholder="Để trống sẽ dùng tiêu đề bài"
                    maxLength={70}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/30"
                  />
                  <p className="mt-1 flex justify-between text-[11px] text-gray-400">
                    <span>Hiển thị trên Google</span>
                    <span className={form.metaTitle.length > 60 ? "text-amber-600" : ""}>
                      {form.metaTitle.length}/70
                    </span>
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Meta Description</label>
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                    placeholder="Mô tả ngắn cho Google"
                    rows={3}
                    maxLength={170}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#8B1A1A] focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/30"
                  />
                  <p className="mt-1 flex justify-between text-[11px] text-gray-400">
                    <span>Đoạn mô tả dưới tiêu đề</span>
                    <span className={form.metaDescription.length > 160 ? "text-amber-600" : ""}>
                      {form.metaDescription.length}/170
                    </span>
                  </p>
                </div>

                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    Xem trước trên Google
                  </p>
                  <p className="truncate text-sm font-medium text-blue-700">
                    {form.metaTitle || form.title || "(Chưa có tiêu đề)"}
                  </p>
                  <p className="text-[11px] text-green-700">yourdomain.com/news/{form.slug || "..."}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                    {form.metaDescription || "(Chưa có mô tả — Google sẽ tự lấy đoạn đầu nội dung)"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>
    );
  }

  // ── LIST MODE ────────────────────────────────────────────────────────────
  return (
    <>
      <AdminPageHeader
        title="Tin tức / Blog"
        description="Quản lý bài viết, tin tức hiển thị tại trang /news. Hỗ trợ ảnh + soạn thảo trực quan."
        actions={<Button onClick={openCreate}>+ Thêm bài viết</Button>}
      />

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          <Loader2 size={16} className="mx-auto mb-2 animate-spin text-gray-400" />
          Đang tải...
        </div>
      ) : posts.length === 0 ? (
        <AdminEmpty
          title="Chưa có bài viết nào."
          description='Bấm "+ Thêm bài viết" để tạo bài đầu tiên.'
        />
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
                <TD>
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image}
                        alt=""
                        className="h-10 w-14 flex-shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-14 flex-shrink-0 items-center justify-center rounded bg-amber-50 text-amber-300">
                        <ImageIcon size={14} />
                      </div>
                    )}
                    <span className="line-clamp-2 font-medium text-gray-900">{p.title}</span>
                  </div>
                </TD>
                <TD className="font-mono text-xs text-gray-500">/news/{p.slug}</TD>
                <TD>
                  <button
                    onClick={() => togglePublish(p)}
                    className={`text-xs px-2 py-1 rounded font-semibold ${
                      p.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {p.isPublished ? "Đã xuất bản" : "Nháp"}
                  </button>
                </TD>
                <TD className="text-xs text-gray-500">
                  {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                </TD>
                <TD className="text-right space-x-3">
                  <a
                    href={`/news/${p.slug}${p.isPublished ? "" : "?preview=true"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Xem
                  </a>
                  <button
                    onClick={() => openEdit(p)}
                    className="text-sm font-semibold text-[#8B1A1A] hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Xoá
                  </button>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
