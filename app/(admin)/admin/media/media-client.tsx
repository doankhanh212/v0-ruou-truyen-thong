"use client";

import { useEffect, useState } from "react";

type MediaItem = {
  id: number;
  type: string;
  url: string;
  title: string | null;
  createdAt: string;
};

const TYPES = ["logo", "banner", "slideshow", "popup", "fanpage_image"] as const;
type MediaType = (typeof TYPES)[number];

const TYPE_LABEL: Record<MediaType, string> = {
  logo: "Logo",
  banner: "Banner Hero",
  slideshow: "Slideshow",
  popup: "Popup",
  fanpage_image: "Ảnh Fanpage",
};

export function MediaClient() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MediaType | "all">("all");
  const [type, setType] = useState<MediaType>("banner");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const qs = filter === "all" ? "" : `?type=${filter}`;
      const res = await fetch(`/api/media${qs}`);
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Chọn file ảnh trước");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      if (title) fd.append("title", title);
      const res = await fetch("/api/media", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Upload thất bại");
        return;
      }
      setFile(null);
      setTitle("");
      const fileInput = document.getElementById("media-file") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      await load();
    } catch {
      setError("Không kết nối được tới server");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Xóa media này?")) return;
    const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Thư viện media</h1>

      <form onSubmit={handleUpload} className="rounded border bg-white p-4 space-y-3">
        <h2 className="font-medium">Tải lên ảnh mới</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Loại</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MediaType)}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Tiêu đề (tùy chọn)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">File ảnh (≤ 3MB)</label>
            <input
              id="media-file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={uploading}
          className="rounded bg-[#8B1A1A] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {uploading ? "Đang tải lên..." : "Tải lên"}
        </button>
      </form>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Lọc loại:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as MediaType | "all")}
          className="rounded border px-2 py-1 text-sm"
        >
          <option value="all">Tất cả</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải...</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-sm font-medium text-gray-700">Chưa có media nào.</p>
          <p className="mt-1 text-xs text-gray-500">Tải ảnh lên ở đây để sử dụng lại khi tạo sản phẩm, bài viết hoặc banner.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((m) => (
            <div key={m.id} className="overflow-hidden rounded border bg-white">
              <div className="aspect-video w-full bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.title ?? m.type} className="h-full w-full object-cover" />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium uppercase text-gray-500">{m.type}</p>
                {m.title && <p className="text-sm truncate">{m.title}</p>}
                <p className="truncate text-xs text-gray-400">{m.url}</p>
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  className="mt-2 text-xs text-red-600 hover:underline"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
