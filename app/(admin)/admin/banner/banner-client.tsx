"use client";

import { useEffect, useState } from "react";

type Banner = {
  id: number;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  position: string;
  sortOrder: number;
  isActive: boolean;
};

const POSITION_LABEL: Record<string, string> = {
  home_hero: "Trang chủ — Hero",
};

// Kích thước khuyến nghị cho từng vị trí banner.
// Tỉ lệ Hero hiện tại trên frontend là ~5:4 (h-[460px] @ width 50vw trên desktop ≈ 720×460)
// nhưng để đẹp trên mọi viewport, đề xuất rộng hơn để Next/Image có thể downscale.
const SIZE_HINT: Record<string, string> = {
  home_hero: "Kích thước khuyến nghị: 1200 × 900 px (tỉ lệ ~4:3) — file ≤ 3MB, định dạng JPG/PNG/WebP.",
};

export function BannerClient() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [positions, setPositions] = useState<string[]>(["home_hero"]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [position, setPosition] = useState("home_hero");
  const [sortOrder, setSortOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const [editPosition, setEditPosition] = useState("home_hero");
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banner");
      if (!res.ok) return;
      const data = await res.json();
      setBanners(data.banners || []);
      if (Array.isArray(data.positions) && data.positions.length) {
        setPositions(data.positions);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Chọn ảnh banner trước");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "banner");
      const uploadRes = await fetch("/api/media", { method: "POST", body: fd });
      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => ({}));
        setError(data.error || "Upload thất bại");
        return;
      }
      const uploaded = await uploadRes.json();

      const res = await fetch("/api/admin/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploaded.url,
          linkUrl: linkUrl || undefined,
          position,
          sortOrder,
          isActive: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Tạo banner thất bại");
        return;
      }
      setFile(null);
      setLinkUrl("");
      setSortOrder(0);
      const input = document.getElementById("banner-file") as HTMLInputElement | null;
      if (input) input.value = "";
      await load();
    } catch {
      setError("Không kết nối được tới server");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(b: Banner) {
    await fetch(`/api/admin/banner/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !b.isActive }),
    });
    await load();
  }

  async function handleSort(b: Banner, delta: number) {
    await fetch(`/api/admin/banner/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sortOrder: b.sortOrder + delta }),
    });
    await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Xóa banner này?")) return;
    const res = await fetch(`/api/admin/banner/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  function openEdit(b: Banner) {
    setEditingBanner(b);
    setEditLinkUrl(b.linkUrl ?? "");
    setEditPosition(b.position);
    setEditSortOrder(b.sortOrder);
    setEditImageUrl(b.imageUrl);
    setEditFile(null);
    setEditError(null);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBanner) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      let imageUrl = editImageUrl;
      if (editFile) {
        const fd = new FormData();
        fd.append("file", editFile);
        fd.append("type", "banner");
        const uploadRes = await fetch("/api/media", { method: "POST", body: fd });
        if (!uploadRes.ok) {
          const data = await uploadRes.json().catch(() => ({}));
          setEditError(data.error || "Upload thất bại");
          return;
        }
        const uploaded = await uploadRes.json();
        imageUrl = uploaded.url;
      }

      const res = await fetch(`/api/admin/banner/${editingBanner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          linkUrl: editLinkUrl || null,
          position: editPosition,
          sortOrder: editSortOrder,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setEditError(data.error || "Lưu thất bại");
        return;
      }
      setEditingBanner(null);
      await load();
    } catch {
      setEditError("Không kết nối được tới server");
    } finally {
      setEditSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Banner</h1>
      <p className="text-sm text-gray-600">
        Banner hiển thị ở các vị trí trọng yếu của frontend. Có thể thêm nhiều ảnh — frontend sẽ tự động chạy slide.
        Tắt <em>isActive</em> để ẩn mà không xóa.
      </p>

      <form onSubmit={handleCreate} className="space-y-3 rounded border bg-white p-4">
        <h2 className="font-medium">Thêm banner mới</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Vị trí</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              {positions.map((p) => (
                <option key={p} value={p}>
                  {POSITION_LABEL[p] ?? p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Thứ tự (nhỏ hiển thị trước)
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Link khi click (tùy chọn)
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="https://... hoặc /san-pham"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-gray-600">Ảnh banner</label>
            <input
              id="banner-file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
            <p className="mt-1 text-xs text-amber-700">
              💡 {SIZE_HINT[position] ?? "Kích thước khuyến nghị: 1200 × 900 px, ≤ 3MB."}
            </p>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-[#8B1A1A] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Đang lưu..." : "Tạo banner"}
        </button>
      </form>

      {/* Edit form */}
      {editingBanner && (
        <form onSubmit={handleEditSave} className="space-y-3 rounded border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-blue-800">Sửa banner #{editingBanner.id}</h2>
            <button
              type="button"
              onClick={() => setEditingBanner(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ✕ Đóng
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Vị trí</label>
              <select
                value={editPosition}
                onChange={(e) => setEditPosition(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                {positions.map((p) => (
                  <option key={p} value={p}>{POSITION_LABEL[p] ?? p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Thứ tự</label>
              <input
                type="number"
                value={editSortOrder}
                onChange={(e) => setEditSortOrder(Number(e.target.value) || 0)}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">Link khi click</label>
              <input
                type="url"
                value={editLinkUrl}
                onChange={(e) => setEditLinkUrl(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="https://... hoặc /san-pham"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Ảnh mới (để trống để giữ ảnh cũ)
              </label>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={editImageUrl} alt="" className="mb-2 h-16 w-auto rounded border object-cover" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm"
              />
              <p className="mt-1 text-xs text-amber-700">
                💡 {SIZE_HINT[editPosition] ?? "Kích thước khuyến nghị: 1200 × 900 px, ≤ 3MB."}
              </p>
            </div>
          </div>
          {editError && <p className="text-sm text-red-600">{editError}</p>}
          <button
            type="submit"
            disabled={editSubmitting}
            className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {editSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải...</p>
      ) : banners.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-sm font-medium text-gray-700">Chưa có banner nào.</p>
          <p className="mt-1 text-xs text-gray-500">Trang chủ sẽ hiển thị khối "Banner đang được cập nhật" cho đến khi bạn tạo banner đầu tiên.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {banners.map((b) => (
            <div key={b.id} className="overflow-hidden rounded border bg-white">
              <div className="aspect-[4/3] w-full bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.imageUrl} alt={b.position} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-1 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase text-gray-500">
                    {POSITION_LABEL[b.position] ?? b.position}
                  </p>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      b.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {b.isActive ? "Hiển thị" : "Ẩn"}
                  </span>
                </div>
                {b.linkUrl && (
                  <p className="truncate text-xs text-blue-600" title={b.linkUrl}>🔗 {b.linkUrl}</p>
                )}
                <p className="text-xs text-gray-400">Thứ tự: {b.sortOrder}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(b)}
                    className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    {b.isActive ? "Ẩn" : "Bật"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(b)}
                    className="rounded border border-blue-200 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSort(b, -1)}
                    className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                    title="Lên trên"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSort(b, 1)}
                    className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                    title="Xuống dưới"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id)}
                    className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
