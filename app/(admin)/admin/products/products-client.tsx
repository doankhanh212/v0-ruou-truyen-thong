"use client";

import { useEffect, useRef, useState } from "react";
import { Table, THead, TR, TH, TD } from "@/components/admin/table";
import { Button, Field, Input, Select, Textarea } from "@/components/admin/form";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  priceOld: number | null;
  category: string;
  categoryId: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
  description: string | null;
  inStock: boolean;
  featured: boolean;
  sortOrder: number;
  images: { id: number; url: string; isPrimary: boolean; sortOrder: number }[];
  categoryRel?: { id: number; name: string; slug: string } | null;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
};

const EMPTY_FORM = {
  name: "",
  slug: "",
  price: "",
  priceOld: "",
  categoryId: "",
  imageUrl: "",
  imageAlt: "",
  description: "",
  featured: false,
  inStock: true,
  volume: "",
  alcohol: "",
  origin: "",
  sortOrder: "0",
};

export function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingSlot, setUploadingSlot] = useState<"primary" | "gallery" | null>(null);
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);
      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products);
      }
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories((data.categories || []).filter((c: Category) => c.isActive));
      }
    } catch (err) {
      console.error("[admin products load]", err);
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
    setImageUrls([]);
    setShowForm(true);
    setError(null);
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name,
      slug: p.slug,
      price: String(p.price),
      priceOld: p.priceOld ? String(p.priceOld) : "",
      categoryId: p.categoryId ? String(p.categoryId) : "",
      imageUrl: p.imageUrl || "",
      imageAlt: p.imageAlt || "",
      description: p.description || "",
      featured: p.featured,
      inStock: p.inStock,
      volume: (p as Product & { volume?: string }).volume ?? "",
      alcohol: (p as Product & { alcohol?: string }).alcohol ?? "",
      origin: (p as Product & { origin?: string }).origin ?? "",
      sortOrder: String(p.sortOrder ?? 0),
    });
    setEditingId(p.id);
    setImageUrls(
      p.images?.filter((img) => !img.isPrimary && img.url !== p.imageUrl).map((img) => img.url) || []
    );
    setShowForm(true);
    setError(null);
  }

  async function uploadFile(file: File, slot: "primary" | "gallery") {
    setUploadingSlot(slot);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "product");
      const res = await fetch("/api/media", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Upload thất bại");
        return;
      }
      const data = await res.json();
      const url: string = data.url;
      if (!url) return;
      if (slot === "primary") {
        setForm((current) => ({ ...current, imageUrl: url }));
      } else {
        setImageUrls((current) => (current.includes(url) ? current : [...current, url]));
      }
    } catch (err) {
      console.error("[admin products upload]", err);
      setError("Không kết nối được tới server");
    } finally {
      setUploadingSlot(null);
    }
  }

  function removeGalleryImage(idx: number) {
    setImageUrls(imageUrls.filter((_, i) => i !== idx));
  }

  function promoteGalleryImage(idx: number) {
    const url = imageUrls[idx];
    if (!url) return;
    const previousPrimary = form.imageUrl;
    setImageUrls((current) => {
      const next = current.filter((_, i) => i !== idx);
      return previousPrimary ? [previousPrimary, ...next] : next;
    });
    setForm((current) => ({ ...current, imageUrl: url }));
  }

  function moveGalleryImage(idx: number, direction: -1 | 1) {
    setImageUrls((current) => {
      const target = idx + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.categoryId) {
      setError("Vui lòng chọn danh mục");
      return;
    }
    if (!form.imageUrl) {
      setError("Vui lòng tải lên ảnh chính");
      return;
    }
    if (!form.imageAlt.trim() || form.imageAlt.trim().length < 3) {
      setError("Vui lòng nhập Alt text mô tả ảnh (tối thiểu 3 ký tự)");
      return;
    }

    const payload = {
      name: form.name,
      slug: form.slug,
      price: Number(form.price),
      priceOld: form.priceOld ? Number(form.priceOld) : null,
      categoryId: Number(form.categoryId),
      imageUrl: form.imageUrl,
      imageAlt: form.imageAlt.trim(),
      description: form.description || null,
      featured: form.featured,
      inStock: form.inStock,
      imageUrls,
      volume: form.volume || null,
      alcohol: form.alcohol || null,
      origin: form.origin || null,
      sortOrder: Number(form.sortOrder) || 0,
    };
    const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
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
      console.error("[admin products save]", err);
      setError("Không kết nối được tới server");
    }
  }

  async function remove(id: number) {
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) await load();
    } catch (err) {
      console.error("[admin products remove]", err);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl">Sản phẩm</h1>
        <Button onClick={openCreate}>+ Thêm sản phẩm</Button>
      </div>

      {showForm && (
        <form onSubmit={save} className="mb-6 space-y-4 rounded border bg-white p-4 sm:p-5">
          <h2 className="font-medium">{editingId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Tên sản phẩm">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Slug (để trống sẽ tự sinh từ tên)">
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="vd: ruou-minh-mang" />
            </Field>
            <Field label="Giá (VND)">
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </Field>
            <Field label="Giá gốc (tuỳ chọn)">
              <Input
                type="number"
                min={0}
                value={form.priceOld}
                onChange={(e) => setForm({ ...form, priceOld: e.target.value })}
              />
            </Field>
            <Field label="Danh mục">
              <Select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Thứ tự hiển thị">
              <Input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              />
            </Field>
            <Field label="Dung tích (vd: 500ml)">
              <Input
                value={form.volume}
                onChange={(e) => setForm({ ...form, volume: e.target.value })}
                placeholder="500ml"
              />
            </Field>
            <Field label="Độ cồn (vd: 40%)">
              <Input
                value={form.alcohol}
                onChange={(e) => setForm({ ...form, alcohol: e.target.value })}
                placeholder="40%"
              />
            </Field>
            <Field label="Xuất xứ">
              <Input
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                placeholder="Việt Nam"
              />
            </Field>
          </div>

          <Field label="Mô tả ngắn">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả dùng cho trang chi tiết và SEO"
            />
          </Field>

          <div className="space-y-3 rounded border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <div>
              <p className="text-sm font-medium text-slate-700">Ảnh chính</p>
              <p className="text-xs text-slate-500">Ảnh hiển thị đầu tiên trên trang sản phẩm.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded border bg-white">
                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageUrl} alt="Ảnh chính" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    Chưa có ảnh
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={primaryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file, "primary");
                    e.currentTarget.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => primaryInputRef.current?.click()}
                  disabled={uploadingSlot === "primary"}
                >
                  {uploadingSlot === "primary"
                    ? "Đang tải lên..."
                    : form.imageUrl
                      ? "Đổi ảnh chính"
                      : "Tải ảnh chính lên"}
                </Button>
                {form.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: "" })}
                    className="text-left text-xs text-red-600 hover:underline"
                  >
                    Gỡ ảnh chính
                  </button>
                )}
              </div>
            </div>
            <Field label="Alt text (mô tả ảnh — bắt buộc cho SEO & a11y)">
              <Input
                value={form.imageAlt}
                onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
                placeholder="VD: Chai rượu nếp than Cửu Long 500ml đóng hộp gỗ"
                maxLength={160}
                required
              />
            </Field>
          </div>

          <div className="space-y-3 rounded border border-slate-200 p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Ảnh phụ (gallery)</p>
                <p className="text-xs text-slate-500">
                  Hiển thị dưới dạng thumbnail dưới ảnh chính. Khách bấm để chuyển ảnh. Thứ tự ở đây = thứ tự ngoài trang.
                </p>
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFile(file, "gallery");
                  e.currentTarget.value = "";
                }}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingSlot === "gallery"}
              >
                {uploadingSlot === "gallery" ? "Đang tải lên..." : "+ Tải ảnh phụ"}
              </Button>
            </div>
            {imageUrls.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
                Chưa có ảnh phụ nào. Bấm "+ Tải ảnh phụ" để thêm.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {imageUrls.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="relative aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                        #{idx + 1}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 border-t border-slate-100 bg-slate-50 px-1.5 py-1.5">
                      <div className="flex gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveGalleryImage(idx, -1)}
                          disabled={idx === 0}
                          title="Di chuyển trái"
                          className="rounded px-1.5 py-1 text-xs text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGalleryImage(idx, 1)}
                          disabled={idx === imageUrls.length - 1}
                          title="Di chuyển phải"
                          className="rounded px-1.5 py-1 text-xs text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                        >
                          →
                        </button>
                      </div>
                      <div className="flex gap-0.5">
                        <button
                          type="button"
                          onClick={() => promoteGalleryImage(idx)}
                          title="Đặt làm ảnh chính"
                          className="rounded px-1.5 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-50"
                        >
                          Đặt chính
                        </button>
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          title="Gỡ ảnh"
                          className="rounded px-1.5 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                        >
                          Gỡ
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Nổi bật
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
              />
              <span className={form.inStock ? "text-green-700 font-semibold" : "text-red-600 font-semibold"}>
                {form.inStock ? "Còn hàng" : "Hết hàng"}
              </span>
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
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-sm font-medium text-gray-700">Chưa có sản phẩm nào.</p>
          <p className="mt-1 text-xs text-gray-500">Bấm "+ Thêm sản phẩm" để tạo mới.</p>
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Tên</TH>
              <TH>Danh mục</TH>
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
                <TD>{p.categoryRel?.name || categories.find((c) => c.id === p.categoryId)?.name || "—"}</TD>
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
          </tbody>
        </Table>
      )}
    </div>
  );
}
