"use client";

import { useEffect, useState } from "react";
import { Select } from "@/components/admin/form";

type DayData = { day: number; page_view: number; click_zalo: number; click_call: number };
type Totals = { page_view: number; click_zalo: number; click_call: number; total: number };

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const COLORS = {
  page_view: "#3b82f6",
  click_zalo: "#22c55e",
  click_call: "#f59e0b",
};

export function DashboardChart() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [daily, setDaily] = useState<DayData[]>([]);
  const [totals, setTotals] = useState<Totals>({ page_view: 0, click_zalo: 0, click_call: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Convert month/year selection → from/to date strings expected by the API
    const mm = String(month).padStart(2, "0");
    const daysInMonth = new Date(year, month, 0).getDate();
    const from = `${year}-${mm}-01`;
    const to = `${year}-${mm}-${String(daysInMonth).padStart(2, "0")}`;

    // Pre-fill 1..daysInMonth so the chart shows the full month even when
    // some days have zero events. Real data overlays via merging by day.
    const baseline: DayData[] = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      page_view: 0,
      click_zalo: 0,
      click_call: 0,
    }));

    fetch(`/api/admin/analytics?from=${from}&to=${to}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        type RawDay = { date: string; views: number; zalo: number; calls: number };
        const byDay = new Map<number, RawDay>();
        for (const row of (data.trafficByDay ?? []) as RawDay[]) {
          const d = Number(row.date.split("-")[2]);
          if (Number.isFinite(d)) byDay.set(d, row);
        }
        const merged = baseline.map((b) => {
          const hit = byDay.get(b.day);
          return hit
            ? { day: b.day, page_view: hit.views, click_zalo: hit.zalo, click_call: hit.calls }
            : b;
        });
        setDaily(merged);

        const ov = data.overview ?? {};
        const pv = ov.totalViews ?? 0;
        const zl = ov.totalZaloClicks ?? 0;
        const cc = ov.totalCalls ?? 0;
        setTotals({ page_view: pv, click_zalo: zl, click_call: cc, total: pv + zl + cc });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[dashboard-chart] load failed:", err);
        setDaily(baseline);
        setTotals({ page_view: 0, click_zalo: 0, click_call: 0, total: 0 });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [month, year]);

  // SVG line chart — wider so 30-31 day labels don't crowd
  const W = 900;
  const H = 260;
  const PAD = { top: 20, right: 20, bottom: 32, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(1, ...daily.map((d) => Math.max(d.page_view, d.click_zalo, d.click_call)));
  const xStep = daily.length > 1 ? chartW / (daily.length - 1) : chartW;

  function toPoints(key: keyof Omit<DayData, "day">) {
    return daily
      .map((d, i) => {
        const x = PAD.left + i * xStep;
        const y = PAD.top + chartH - (d[key] / maxVal) * chartH;
        return `${x},${y}`;
      })
      .join(" ");
  }

  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="bg-white border rounded p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium text-lg">Thống kê truy cập</h2>
        <div className="flex gap-2">
          <Select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="!w-auto"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </Select>
          <Select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="!w-auto"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Legend + totals */}
      <div className="flex gap-6 text-sm mb-4">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ background: COLORS.page_view }} />
          Page views: <strong>{totals.page_view}</strong>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ background: COLORS.click_zalo }} />
          Click Zalo: <strong>{totals.click_zalo}</strong>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ background: COLORS.click_call }} />
          Click Call: <strong>{totals.click_call}</strong>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 py-8 text-center">Đang tải...</p>
      ) : (
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 500 }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((f) => {
              const y = PAD.top + chartH * (1 - f);
              return (
                <g key={f}>
                  <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#e5e7eb" strokeWidth={1} />
                  <text x={PAD.left - 5} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-400">
                    {Math.round(maxVal * f)}
                  </text>
                </g>
              );
            })}

            {/* X axis: tick mark + day number for EVERY single day (1..N) */}
            {daily.map((d, i) => {
              const x = PAD.left + i * xStep;
              return (
                <g key={d.day}>
                  <line
                    x1={x}
                    y1={PAD.top + chartH}
                    x2={x}
                    y2={PAD.top + chartH + 4}
                    stroke="#9ca3af"
                    strokeWidth={1}
                  />
                  <text
                    x={x}
                    y={H - 6}
                    textAnchor="middle"
                    fontSize={8}
                    className="fill-gray-500"
                  >
                    {d.day}
                  </text>
                </g>
              );
            })}

            {/* Data point dots so admin sees there ARE 30 data points */}
            {daily.map((d, i) => {
              const x = PAD.left + i * xStep;
              const yView = PAD.top + chartH - (d.page_view / maxVal) * chartH;
              return (
                <circle
                  key={`pv-${d.day}`}
                  cx={x}
                  cy={yView}
                  r={2}
                  fill={COLORS.page_view}
                />
              );
            })}

            {/* Lines */}
            <polyline fill="none" stroke={COLORS.page_view} strokeWidth={2} points={toPoints("page_view")} />
            <polyline fill="none" stroke={COLORS.click_zalo} strokeWidth={2} points={toPoints("click_zalo")} />
            <polyline fill="none" stroke={COLORS.click_call} strokeWidth={2} points={toPoints("click_call")} />
          </svg>
        </div>
      )}
    </div>
  );
}
