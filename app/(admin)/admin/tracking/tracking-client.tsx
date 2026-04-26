"use client";

import { useEffect, useState } from "react";
import { Table, THead, TR, TH, TD } from "@/components/admin/table";
import { Select } from "@/components/admin/form";

type Log = {
  id: number;
  event: string;
  sessionId: string;
  productId: number | null;
  metadata: unknown;
  createdAt: string;
};

const EVENTS = ["", "page_view", "click_product", "click_zalo", "chatbot_open", "ai_recommend", "click_call"];

const COLOR: Record<string, string> = {
  page_view: "bg-blue-100 text-blue-700",
  click_product: "bg-indigo-100 text-indigo-700",
  click_zalo: "bg-green-100 text-green-700",
  chatbot_open: "bg-yellow-100 text-yellow-700",
  ai_recommend: "bg-orange-100 text-orange-700",
  click_call: "bg-red-100 text-red-700",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}
function sevenDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

export function TrackingClient() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState("");
  const [dateFrom, setDateFrom] = useState(sevenDaysAgo());
  const [dateTo, setDateTo] = useState(today());
  const [cleaning, setCleaning] = useState(false);

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams({ limit: "50" });
    if (event) qs.set("event", event);
    if (dateFrom) qs.set("dateFrom", dateFrom);
    if (dateTo) qs.set("dateTo", dateTo);
    const res = await fetch(`/api/admin/tracking?${qs}`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, dateFrom, dateTo]);

  async function handleCleanup() {
    if (!confirm("Xóa toàn bộ log cũ hơn 30 ngày? Không thể hoàn tác.")) return;
    setCleaning(true);
    try {
      const res = await fetch("/api/admin/tracking/cleanup", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        alert(`Đã xóa ${data.deleted ?? 0} log cũ.`);
        await load();
      }
    } finally {
      setCleaning(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-semibold">Tracking logs</h1>
        <button
          type="button"
          onClick={handleCleanup}
          disabled={cleaning}
          className="rounded border border-red-200 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {cleaning ? "Đang xóa..." : "Dọn log > 30 ngày"}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-full sm:w-auto">
          <label className="mb-1 block text-xs font-medium text-gray-600">Event</label>
          <Select value={event} onChange={(e) => setEvent(e.target.value)} className="!w-auto">
            {EVENTS.map((ev) => (
              <option key={ev} value={ev}>
                {ev || "Tất cả events"}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Từ ngày</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Đến ngày</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải...</p>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Thời gian</TH>
              <TH>Event</TH>
              <TH>Session</TH>
              <TH>Product</TH>
              <TH>Metadata</TH>
            </TR>
          </THead>
          <tbody>
            {logs.map((l) => (
              <TR key={l.id}>
                <TD className="text-xs whitespace-nowrap">
                  {new Date(l.createdAt).toLocaleString("vi-VN")}
                </TD>
                <TD>
                  <span className={`text-xs px-2 py-1 rounded ${COLOR[l.event] ?? "bg-gray-100"}`}>
                    {l.event}
                  </span>
                </TD>
                <TD className="text-xs font-mono">{l.sessionId.slice(0, 8)}...</TD>
                <TD>{l.productId ?? "—"}</TD>
                <TD className="text-xs font-mono max-w-md truncate">
                  {l.metadata ? JSON.stringify(l.metadata) : "—"}
                </TD>
              </TR>
            ))}
            {logs.length === 0 && (
              <TR>
                <TD className="py-6 text-center text-sm text-gray-500">
                  Chưa ghi nhận hoạt động nào trong khoảng thời gian này.
                </TD>
              </TR>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
}
