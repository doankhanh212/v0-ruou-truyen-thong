"use client";

import { useEffect, useState } from "react";
import { Table, THead, TR, TH, TD } from "@/components/admin/table";
import { Button, Field, Input, Select } from "@/components/admin/form";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  priceOld: number | null;
  category: string;
  imageUrl: string;
  inStock: boolean;
  featured: boolean;
  sortOrder: number;
};

const CATEGORIES = [
  { value: "ruou-nep", label: "Rượu Nếp" },
  { value: "ruou-thuoc", label: "Rượu Thuốc" },
  { value: "ruou-trai-cay", label: "Rượu Trái Cây" },
  { value: "qua-tang", label: "Quà Tặng / Combo" },
];

const EMPTY_FORM = {
  name: "",
  slug: "",
  price: "",
  priceOld: "",
  category: "ruou-nep",
  imageUrl: "",
  featured: false,
  inStock: true,
};

export function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
    }
    setLoading(false);
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

  function openEdit(p: Product) {
    setForm({
      name: p.name,
      slug: p.slug,
      price: String(p.price),
      priceOld: p.priceOld ? String(p.priceOld) : "",
      category: p.category,
      imageUrl: p.imageUrl,
      featured: p.featured,
      inStock: p.inStock,
    });
    setEditingId(p.id);
    setShowForm(true);
    setError(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      slug: form.slug,
      price: Number(form.price),
      priceOld: form.priceOld ? Number(form.priceOld) : null,
      category: form.category,
      imageUrl: form.imageUrl,
      featured: form.featured,
      inStock: form.inStock,
    };
    const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const method = editingId ? "PATCH" : "POST";
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
  }

  async function remove(id: number) {
    if (!confirm("Xóa sản phẩm này?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Sản phẩm</h1>
        <Button onClick={openCreate}>+ Thêm sản phẩm</Button>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-white border rounded p-5 mb-6 space-y-3">
          <h2 className="font-medium">{editingId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Tên">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Slug">
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            </Field>
            <Field label="Giá (VND)">
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </Field>
            <Field label="Giá gốc">
              <Input type="number" value={form.priceOld} onChange={(e) => setForm({ ...form, priceOld: e.target.value })} />
            </Field>
            <Field label="Category">
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Image URL">
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required />
            </Field>
          </div>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Nổi bật
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} />
              Còn hàng
            </label>
          </div>
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
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Tên</TH>
              <TH>Category</TH>
              <TH>Giá</TH>
              <TH>Còn hàng</TH>
              <TH>Nổi bật</TH>
              <TH className="text-right">Hành động</TH>
            </TR>
          </THead>
          <tbody>
            {products.map((p) => (
              <TR key={p.id}>
                <TD>{p.name}</TD>
                <TD>{p.category}</TD>
                <TD>{p.price.toLocaleString("vi-VN")}đ</TD>
                <TD>{p.inStock ? "✓" : "—"}</TD>
                <TD>{p.featured ? "✓" : "—"}</TD>
                <TD className="text-right space-x-2">
                  <button onClick={() => openEdit(p)} className="text-sm text-[#8B1A1A] hover:underline">
                    Sửa
                  </button>
                  <button onClick={() => remove(p.id)} className="text-sm text-red-600 hover:underline">
                    Xóa
                  </button>
                </TD>
              </TR>
            ))}
            {products.length === 0 && (
              <TR>
                <TD className="text-center text-gray-500">Chưa có sản phẩm</TD>
              </TR>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
}
