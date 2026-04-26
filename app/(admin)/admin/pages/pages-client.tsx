"use client";

import { useEffect, useState } from "react";
import { Table, THead, TR, TH, TD } from "@/components/admin/table";
import { Button, Field, Input, Textarea } from "@/components/admin/form";

type PageItem = {
  id: number;
  slug: string;
  title: string;
  content: string;
  isActive: boolean;
  isPublished: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: string;
};

const EMPTY: Omit<PageItem, "id" | "updatedAt"> = {
  slug: "",
  title: "",
  content: "",
  isActive: true,
  isPublished: true,
  metaTitle: null,
  metaDescription: null,
};

export function PagesClient() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PageItem | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/pages");
    if (res.ok) {
      const data = await res.json();
      setPages(data.pages);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
  }

  function startEdit(page: PageItem) {
    setEditing(page);
    setForm({
      slug: page.slug,
      title: page.title,
      content: page.content,
      isActive: page.isActive,
      isPublished: page.isPublished,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
    });
    setError(null);
  }

  function cancel() {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);

    const isNew = !editing;
    const url = isNew ? "/api/admin/pages" : `/api/admin/pages/${editing!.id}`;
    const method = isNew ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Lỗi khi lưu");
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditing(null);
    setForm(EMPTY);
    await load();
  }

  async function toggle(page: PageItem) {
    await fetch(`/api/admin/pages/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !page.isActive }),
    });
    await load();
  }

  async function togglePublish(page: PageItem) {
    await fetch(`/api/admin/pages/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !page.isPublished }),
    });
    await load();
  }

  async function remove(page: PageItem) {
    if (!confirm(`Xóa trang "${page.title}"?`)) return;
    await fetch(`/api/admin/pages/${page.id}`, { method: "DELETE" });
    await load();
  }

  const showForm = editing !== null || form !== EMPTY;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Trang CMS</h1>
        {!showForm && (
          <Button onClick={startCreate}>+ Tạo trang mới</Button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Quản lý nội dung các trang tĩnh (Giới thiệu, Liên hệ…). Nếu trang có nội dung, nó sẽ thay thế giao diện mặc định.
      </p>

      {/* ---- FORM ---- */}
      {(editing || form.slug !== "" || form.title !== "" || form.content !== "") ? (
        <div className="bg-white border rounded p-5 mb-6 space-y-4">
          <h2 className="font-medium">
            {editing ? `Sửa: ${editing.title}` : "Tạo trang mới"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Slug (URL path, vd: gioi-thieu)">
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="gioi-thieu"
                disabled={!!editing}
              />
            </Field>
            <Field label="Tiêu đề">
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Giới Thiệu"
              />
            </Field>
          </div>

          <Field label="Nội dung (HTML)">
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={12}
              placeholder="<h2>Tiêu đề</h2><p>Nội dung...</p>"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Meta Title (SEO)">
              <Input
                value={form.metaTitle ?? ""}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value || null })}
                placeholder="Để trống = dùng tiêu đề trang"
              />
            </Field>
            <Field label="Meta Description (SEO)">
              <Input
                value={form.metaDescription ?? ""}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value || null })}
                placeholder="Để trống = dùng mô tả mặc định"
              />
            </Field>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <label htmlFor="isActive" className="text-sm">Hiển thị (isActive)</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              />
              <label htmlFor="isPublished" className="text-sm">Xuất bản (isPublished)</label>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button variant="ghost" onClick={cancel}>Hủy</Button>
          </div>
        </div>
      ) : null}

      {/* ---- TABLE ---- */}
      {loading ? (
        <p className="text-sm text-gray-500">Đang tải...</p>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Slug</TH>
              <TH>Tiêu đề</TH>
              <TH>Active</TH>
              <TH>Publish</TH>
              <TH>Cập nhật</TH>
              <TH className="text-right">Hành động</TH>
            </TR>
          </THead>
          <tbody>
            {pages.map((p) => (
              <TR key={p.id}>
                <TD className="font-mono text-xs">/{p.slug}</TD>
                <TD>{p.title}</TD>
                <TD>
                  <button
                    onClick={() => toggle(p)}
                    className={`text-xs px-2 py-1 rounded ${
                      p.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {p.isActive ? "Bật" : "Tắt"}
                  </button>
                </TD>
                <TD>
                  <button
                    onClick={() => togglePublish(p)}
                    className={`text-xs px-2 py-1 rounded ${
                      p.isPublished
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {p.isPublished ? "Đã xuất bản" : "Nháp"}
                  </button>
                </TD>
                <TD className="text-xs text-gray-500">
                  {new Date(p.updatedAt).toLocaleDateString("vi-VN")}
                </TD>
                <TD className="text-right space-x-3">
                  <a
                    href={`/api/admin/pages/preview/${p.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Preview
                  </a>
                  <button
                    onClick={() => startEdit(p)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </TD>
              </TR>
            ))}
            {pages.length === 0 && (
              <TR>
                <TD className="text-center text-gray-500" >
                  Chưa có trang nào. Nhấn &quot;Tạo trang mới&quot; để bắt đầu.
                </TD>
              </TR>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
}
