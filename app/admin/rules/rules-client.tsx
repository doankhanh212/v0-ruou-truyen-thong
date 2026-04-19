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

export function RulesClient() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/rules");
    if (res.ok) {
      const data = await res.json();
      setRules(data.rules);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(rule: Rule) {
    await fetch(`/api/admin/rules/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !rule.isActive }),
    });
    await load();
  }

  async function remove(id: number) {
    if (!confirm("Xóa rule này?")) return;
    await fetch(`/api/admin/rules/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Chatbot Rules</h1>
      <p className="text-sm text-gray-500 mb-4">
        Toggle bật/tắt từng rule. Tạo/sửa chi tiết sẽ được thêm sau.
      </p>

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
                <TD className="text-right">
                  <button onClick={() => remove(r.id)} className="text-sm text-red-600 hover:underline">
                    Xóa
                  </button>
                </TD>
              </TR>
            ))}
            {rules.length === 0 && (
              <TR>
                <TD className="text-center text-gray-500">Chưa có rule</TD>
              </TR>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
}
