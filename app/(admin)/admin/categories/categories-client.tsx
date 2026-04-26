"use client";

import { useEffect, useState } from "react";
import { Table, THead, TR, TH, TD } from "@/components/admin/table";
import { Button, Field, Input } from "@/components/admin/form";

type Category = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  _count?: { products: number };
};

const EMPTY_FORM = { name: "", slug: "", isActive: true, sortOrder: "0" };

export function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("[admin categories load]", err);
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

  function openEdit(c: Category) {
    setForm({
      name: c.name,
      slug: c.slug,
      isActive: c.isActive,
      sortOrder: String(c.sortOrder),
    });
    setEditingId(c.id);
    setShowForm(true);
    setError(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      slug: form.slug,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder),
    };
    const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
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
      console.error("[admin categories save]", err);
      setError("Không kết nối được tới server");
    }
  }

  async function toggleActive(c: Category) {
    try {
      await fetch(`/api/admin/categories/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      await load();
    } catch (err) {
      console.error("[admin categories toggleActive]", err);
    }
  }

  async function remove(c: Category) {
    const productCount = c._count?.products ?? 0;
    if (productCount > 0) {
      alert(`Không thể xóa danh mục "${c.name}" vì còn ${productCount} sản phẩm đang dùng. Hãy chuyển sản phẩm sang danh mục khác trước.`);
      return;
    }
    if (!confirm(`Xóa danh mục "${c.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Không thể xóa");
        return;
      }
      await load();
    } catch (err) {
      console.error("[admin categories remove]", err);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl">Danh mục</h1>
        <Button onClick={openCreate}>+ Thêm danh mục</Button>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-white border rounded p-4 mb-6 space-y-3 sm:p-5">
          <h2 className="font-medium">{editingId ? "Sửa danh mục" : "Thêm danh mục"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Tên danh mục">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Slug (để trống sẽ tự sinh)">
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="vd: ruou-thuoc" />
            </Field>
            <Field label="Thứ tự">
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Hiển thị
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit">Lưu</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Hủy
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải...</p>
      ) : categories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-sm font-medium text-gray-700">Chưa có danh mục nào.</p>
          <p className="mt-1 text-xs text-gray-500">Bấm "+ Thêm danh mục" để tạo mới.</p>
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Tên</TH>
              <TH>Slug</TH>
              <TH>Số sản phẩm</TH>
              <TH>Thứ tự</TH>
              <TH>Trạng thái</TH>
              <TH className="text-right">Hành động</TH>
            </TR>
          </THead>
          <tbody>
            {categories.map((c) => {
              const productCount = c._count?.products ?? 0;
              return (
                <TR key={c.id}>
                  <TD>{c.name}</TD>
                  <TD className="font-mono text-xs">{c.slug}</TD>
                  <TD>
                    <span
                      className={`inline-flex min-w-[2rem] justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        productCount > 0
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {productCount}
                    </span>
                  </TD>
                  <TD>{c.sortOrder}</TD>
                  <TD>
                    <button
                      onClick={() => toggleActive(c)}
                      className={`text-xs px-2 py-1 rounded ${
                        c.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {c.isActive ? "Bật" : "Tắt"}
                    </button>
                  </TD>
                  <TD className="text-right space-x-2">
                    <button onClick={() => openEdit(c)} className="text-sm text-[#8B1A1A] hover:underline">
                      Sửa
                    </button>
                    <button
                      onClick={() => remove(c)}
                      disabled={productCount > 0}
                      title={productCount > 0 ? "Có sản phẩm đang dùng danh mục này" : "Xóa danh mục"}
                      className="text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
                    >
                      Xóa
                    </button>
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
