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

const EVENTS = ["", "page_view", "click_product", "click_zalo", "chatbot_open", "ai_recommend"];

const COLOR: Record<string, string> = {
  page_view: "bg-blue-100 text-blue-700",
  click_product: "bg-indigo-100 text-indigo-700",
  click_zalo: "bg-green-100 text-green-700",
  chatbot_open: "bg-yellow-100 text-yellow-700",
  ai_recommend: "bg-orange-100 text-orange-700",
};

export function TrackingClient() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState("");

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams({ limit: "50" });
    if (event) qs.set("event", event);
    const res = await fetch(`/api/admin/tracking?${qs}`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [event]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Tracking logs</h1>

      <div className="mb-4 max-w-xs">
        <Select value={event} onChange={(e) => setEvent(e.target.value)}>
          {EVENTS.map((ev) => (
            <option key={ev} value={ev}>
              {ev || "Tất cả events"}
            </option>
          ))}
        </Select>
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
                <TD className="text-center text-gray-500">Chưa có log</TD>
              </TR>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
}
