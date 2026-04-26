"use client";

import { useEffect, useState } from "react";
import { Table, THead, TR, TH, TD } from "@/components/admin/table";
import { Button } from "@/components/admin/form";

type Rule = {
  id: number;
  purpose: string;
  budgetMin: number | null;
  budgetMax: number | null;
  preference: string | null;
  recommendedProducts: number[];
  priority: number;
  isActive: boolean;
  note: string | null;
};

type Product = { id: number; name: string };

const EMPTY_FORM = {
  purpose: "",
  budgetMin: "",
  budgetMax: "",
  preference: "",
  note: "",
  priority: "0",
  isActive: true,
  recommendedProducts: [] as number[],
};

export function RulesClient() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [rulesRes, prodsRes] = await Promise.all([
      fetch("/api/admin/rules"),
      fetch("/api/admin/products"),
    ]);
    if (rulesRes.ok) {
      const data = await rulesRes.json();
      setRules(data.rules);
    }
    if (prodsRes.ok) {
      const data = await prodsRes.json();
      setProducts((data.products ?? []).map((p: { id: number; name: string }) => ({ id: p.id, name: p.name })));
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError(null);
    setShowForm(true);
  }

  function openEdit(rule: Rule) {
    setForm({
      purpose: rule.purpose,
      budgetMin: rule.budgetMin != null ? String(rule.budgetMin) : "",
      budgetMax: rule.budgetMax != null ? String(rule.budgetMax) : "",
      preference: rule.preference ?? "",
      note: rule.note ?? "",
      priority: String(rule.priority),
      isActive: rule.isActive,
      recommendedProducts: rule.recommendedProducts,
    });
    setEditingId(rule.id);
    setError(null);
    setShowForm(true);
  }

  function toggleProduct(id: number) {
    setForm((prev) => ({
      ...prev,
      recommendedProducts: prev.recommendedProducts.includes(id)
        ? prev.recommendedProducts.filter((x) => x !== id)
        : [...prev.recommendedProducts, id],
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.purpose.trim()) {
      setError("Vui lòng nhập mục đích của rule");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      purpose: form.purpose.trim(),
      budgetMin: form.budgetMin ? Number(form.budgetMin) : null,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : null,
      preference: form.preference.trim() || null,
      note: form.note.trim() || null,
      priority: Number(form.priority) || 0,
      isActive: form.isActive,
      recommendedProducts: form.recommendedProducts,
    };
    try {
      const url = editingId ? `/api/admin/rules/${editingId}` : "/api/admin/rules";
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
    } catch {
      setError("Không kết nối được tới server");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(rule: Rule) {
    await fetch(`/api/admin/rules/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !rule.isActive }),
    });
    await load();
  }

  async function remove(id: number) {
    if (!confirm("Xóa rule này? Không thể hoàn tác.")) return;
    await fetch(`/api/admin/rules/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chatbot Rules</h1>
        <Button onClick={openCreate}>+ Thêm rule</Button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <form
          onSubmit={save}
          className="mb-6 space-y-4 rounded border bg-white p-4 sm:p-5"
        >
          <h2 className="font-medium">{editingId ? "Sửa rule" : "Thêm rule mới"}</h2>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Mục đích <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                placeholder="vd: Mua tặng bạn bè, Uống vào dịp Tết..."
                required
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Ngân sách tối thiểu (đ)
              </label>
              <input
                type="number"
                min={0}
                value={form.budgetMin}
                onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
                placeholder="0"
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Ngân sách tối đa (đ)
              </label>
              <input
                type="number"
                min={0}
                value={form.budgetMax}
                onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                placeholder="Không giới hạn"
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Sở thích / khẩu vị
              </label>
              <input
                type="text"
                value={form.preference}
                onChange={(e) => setForm({ ...form, preference: e.target.value })}
                placeholder="vd: nhẹ, ngọt, mạnh..."
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Độ ưu tiên (số càng cao càng ưu tiên)
              </label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">Ghi chú nội bộ</label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={2}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rule-active"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <label htmlFor="rule-active" className="text-sm">
                Bật rule này
              </label>
            </div>
          </div>

          {/* Product checkbox list */}
          <div>
            <p className="mb-2 text-xs font-medium text-gray-600">
              Sản phẩm gợi ý ({form.recommendedProducts.length} đã chọn)
            </p>
            {products.length === 0 ? (
              <p className="text-xs text-gray-400">Chưa có sản phẩm nào.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded border bg-gray-50 p-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                {products.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm px-2 py-1 hover:bg-white rounded">
                    <input
                      type="checkbox"
                      checked={form.recommendedProducts.includes(p.id)}
                      onChange={() => toggleProduct(p.id)}
                    />
                    <span className="truncate">{p.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
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
              <TH>Mục đích</TH>
              <TH>Ngân sách</TH>
              <TH>Sở thích</TH>
              <TH>Số SP</TH>
              <TH>Priority</TH>
              <TH>Trạng thái</TH>
              <TH className="text-right">Hành động</TH>
            </TR>
          </THead>
          <tbody>
            {rules.map((r) => (
              <TR key={r.id}>
                <TD>{r.purpose}</TD>
                <TD className="text-xs">
                  {r.budgetMin ? `${r.budgetMin.toLocaleString("vi-VN")}đ` : "—"}
                  {" → "}
                  {r.budgetMax ? `${r.budgetMax.toLocaleString("vi-VN")}đ` : "—"}
                </TD>
                <TD>{r.preference ?? "—"}</TD>
                <TD>{r.recommendedProducts.length}</TD>
                <TD>{r.priority}</TD>
                <TD>
                  <button
                    onClick={() => toggle(r)}
                    className={`text-xs px-2 py-1 rounded ${
                      r.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {r.isActive ? "Đang bật" : "Đã tắt"}
                  </button>
                </TD>
                <TD className="text-right space-x-3">
                  <button
                    onClick={() => openEdit(r)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </TD>
              </TR>
            ))}
            {rules.length === 0 && (
              <TR>
                <TD className="py-6 text-center text-sm text-gray-500">
                  Chưa có quy tắc gợi ý nào. Bấm &quot;+ Thêm rule&quot; để định nghĩa gợi ý sản phẩm theo mục đích, ngân sách và khẩu vị.
                </TD>
              </TR>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
}

