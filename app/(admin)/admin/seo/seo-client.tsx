"use client";

import { useEffect, useRef, useState } from "react";
import { Table, THead, TR, TH, TD } from "@/components/admin/table";
import { Button, Field, Input, Textarea } from "@/components/admin/form";
import { AdminCard, AdminEmpty, AdminPageHeader } from "@/components/admin/ui";

type SeoPage = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  keywords: string | null;
  ogImage: string | null;
  updatedAt: string;
};

type FormState = {
  slug: string;
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
};

const EMPTY_FORM: FormState = {
  slug: "",
  title: "",
  description: "",
  keywords: "",
  ogImage: "",
};

export function SeoClient() {
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);
  const ogInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo");
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages);
      }
    } catch (err) {
      console.error("[admin seo load]", err);
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
    setShowForm(true);
    setError(null);
  }

  function openEdit(p: SeoPage) {
    setForm({
      slug: p.slug,
      title: p.title,
      description: p.description ?? "",
      keywords: p.keywords ?? "",
      ogImage: p.ogImage ?? "",
    });
    setEditingId(p.id);
    setShowForm(true);
    setError(null);
  }

  async function uploadOg(file: File) {
    setUploadingOg(true);
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
      if (data.url) setForm((current) => ({ ...current, ogImage: data.url }));
    } catch (err) {
      console.error("[admin seo upload]", err);
      setError("Không kết nối được tới server");
    } finally {
      setUploadingOg(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      slug: form.slug,
      title: form.title,
      description: form.description.trim() || null,
      keywords: form.keywords.trim() || null,
      ogImage: form.ogImage.trim() || null,
    };
    const url = editingId ? `/api/admin/seo/${editingId}` : "/api/admin/seo";
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
      console.error("[admin seo save]", err);
      setError("Không kết nối được tới server");
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: SeoPage) {
    if (!confirm(`Xoá SEO cho slug "/${p.slug}"?`)) return;
    try {
      const res = await fetch(`/api/admin/seo/${p.id}`, { method: "DELETE" });
      if (res.ok) await load();
    } catch (err) {
      console.error("[admin seo remove]", err);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="SEO Pages"
        description="Quản lý meta title, mô tả và OG image cho từng trang tĩnh trên website (vd: /gioi-thieu, /lien-he)."
        actions={<Button onClick={openCreate}>+ Thêm SEO page</Button>}
      />

      {showForm && (
        <AdminCard
          title={editingId ? "Sửa SEO page" : "Thêm SEO page"}
          className="mb-6"
        >
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Slug (không có dấu /)">
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="vd: gioi-thieu"
                  required
                />
              </Field>
              <Field label="Tiêu đề (Meta Title)">
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  maxLength={200}
                />
              </Field>
            </div>

            <Field label="Mô tả ngắn (Meta Description)">
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={500}
                placeholder="Tóm tắt 150–160 ký tự, hiển thị trên Google."
              />
            </Field>

            <Field label="Từ khoá (cách nhau bởi dấu phẩy)">
              <Input
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                maxLength={500}
                placeholder="vd: rượu truyền thống, rượu thuốc, rượu nếp"
              />
            </Field>

            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-700">OG Image (ảnh khi chia sẻ)</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="h-24 w-44 flex-shrink-0 overflow-hidden rounded border bg-white">
                  {form.ogImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.ogImage} alt="OG image" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      Chưa có ảnh
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={ogInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadOg(f);
                      e.currentTarget.value = "";
                    }}
                  />
                  <Input
                    value={form.ogImage}
                    onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
                    placeholder="URL ảnh (vd: /uploads/og.jpg) hoặc tải lên"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => ogInputRef.current?.click()}
                      disabled={uploadingOg}
                    >
                      {uploadingOg ? "Đang tải..." : "Tải ảnh lên"}
                    </Button>
                    {form.ogImage && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, ogImage: "" })}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Gỡ ảnh
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Huỷ
              </Button>
            </div>
          </form>
        </AdminCard>
      )}

      {loading ? (
        <AdminCard>
          <p className="text-sm text-gray-500">Đang tải...</p>
        </AdminCard>
      ) : pages.length === 0 ? (
        <AdminEmpty
          title="Chưa có SEO page nào."
          description='Bấm "+ Thêm SEO page" để tạo metadata cho /gioi-thieu, /lien-he hoặc bất kỳ slug nào.'
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Slug</TH>
              <TH>Tiêu đề</TH>
              <TH>Mô tả</TH>
              <TH>OG Image</TH>
              <TH className="text-right">Hành động</TH>
            </TR>
          </THead>
          <tbody>
            {pages.map((p) => (
              <TR key={p.id}>
                <TD className="font-mono text-xs text-gray-700">/{p.slug}</TD>
                <TD className="font-medium text-gray-900">{p.title}</TD>
                <TD className="max-w-md truncate text-xs text-gray-500">
                  {p.description ?? "—"}
                </TD>
                <TD>
                  {p.ogImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.ogImage}
                      alt=""
                      className="h-10 w-16 rounded border object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </TD>
                <TD className="text-right space-x-3">
                  <button
                    onClick={() => openEdit(p)}
                    className="text-sm text-[#8B1A1A] hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => remove(p)}
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
