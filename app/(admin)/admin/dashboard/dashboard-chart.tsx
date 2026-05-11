"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [hoverDay, setHoverDay] = useState<number | null>(null);

  // Số ngày trong tháng được chọn
  const daysInMonth = useMemo(() => new Date(year, month, 0).getDate(), [year, month]);

  // Ngày cuối cùng cần hiển thị data line:
  // - Nếu là tháng/năm hiện tại → dừng ở ngày hiện tại
  // - Nếu là tháng/năm trong quá khứ → đầy đủ daysInMonth
  // - Nếu là tháng/năm tương lai → 0 ngày data (chỉ hiển thị trục)
  const lastDayWithData = useMemo(() => {
    const today = new Date();
    if (year < today.getFullYear()) return daysInMonth;
    if (year > today.getFullYear()) return 0;
    if (month < today.getMonth() + 1) return daysInMonth;
    if (month > today.getMonth() + 1) return 0;
    return today.getDate();
  }, [year, month, daysInMonth]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const mm = String(month).padStart(2, "0");
    const from = `${year}-${mm}-01`;
    const to = `${year}-${mm}-${String(daysInMonth).padStart(2, "0")}`;

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
  }, [month, year, daysInMonth]);

  // Phần data thực để vẽ line — cắt sau lastDayWithData
  const visibleData = useMemo(
    () => daily.slice(0, lastDayWithData),
    [daily, lastDayWithData]
  );

  // SVG dimensions
  const W = 900;
  const H = 280;
  const PAD = { top: 20, right: 20, bottom: 32, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(
    1,
    ...visibleData.map((d) => Math.max(d.page_view, d.click_zalo, d.click_call))
  );
  const xStep = daily.length > 1 ? chartW / (daily.length - 1) : chartW;

  function xFor(dayIndex: number) {
    return PAD.left + dayIndex * xStep;
  }
  function yFor(value: number) {
    return PAD.top + chartH - (value / maxVal) * chartH;
  }

  function toPoints(key: keyof Omit<DayData, "day">) {
    return visibleData
      .map((d, i) => `${xFor(i)},${yFor(d[key])}`)
      .join(" ");
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (visibleData.length === 0) return;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    // Convert SVG x → day index (0-based), clamp into visible range
    const idx = Math.round((local.x - PAD.left) / xStep);
    const clamped = Math.max(0, Math.min(visibleData.length - 1, idx));
    setHoverDay(clamped + 1);
  }

  function handleMouseLeave() {
    setHoverDay(null);
  }

  const hoverData =
    hoverDay !== null ? visibleData.find((d) => d.day === hoverDay) ?? null : null;

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
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-4">
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
          <div className="relative" style={{ minWidth: 500 }}>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Grid lines + Y axis labels */}
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

              {/* X axis: tick + day number for EVERY day */}
              {daily.map((d, i) => {
                const x = xFor(i);
                const isFuture = i >= lastDayWithData;
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
                      className={isFuture ? "fill-gray-300" : "fill-gray-500"}
                    >
                      {d.day}
                    </text>
                  </g>
                );
              })}

              {/* Lines (only over visible/past days) */}
              {visibleData.length > 1 && (
                <>
                  <polyline fill="none" stroke={COLORS.page_view} strokeWidth={2} points={toPoints("page_view")} />
                  <polyline fill="none" stroke={COLORS.click_zalo} strokeWidth={2} points={toPoints("click_zalo")} />
                  <polyline fill="none" stroke={COLORS.click_call} strokeWidth={2} points={toPoints("click_call")} />
                </>
              )}

              {/* Data dots */}
              {visibleData.map((d, i) => (
                <g key={`dots-${d.day}`}>
                  <circle cx={xFor(i)} cy={yFor(d.page_view)} r={2.5} fill={COLORS.page_view} />
                  <circle cx={xFor(i)} cy={yFor(d.click_zalo)} r={2.5} fill={COLORS.click_zalo} />
                  <circle cx={xFor(i)} cy={yFor(d.click_call)} r={2.5} fill={COLORS.click_call} />
                </g>
              ))}

              {/* Hover indicator */}
              {hoverData && (
                <line
                  x1={xFor(hoverData.day - 1)}
                  y1={PAD.top}
                  x2={xFor(hoverData.day - 1)}
                  y2={PAD.top + chartH}
                  stroke="#9ca3af"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
              )}
            </svg>

            {/* Tooltip */}
            {hoverData && (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg"
                style={{
                  left: `${(xFor(hoverData.day - 1) / W) * 100}%`,
                  top: `${(yFor(Math.max(hoverData.page_view, hoverData.click_zalo, hoverData.click_call)) / H) * 100}%`,
                  marginTop: -8,
                }}
              >
                <p className="mb-1 font-semibold text-gray-700">
                  Ngày {hoverData.day}/{month}/{year}
                </p>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: COLORS.page_view }} />
                    <span className="text-gray-600">Page views:</span>
                    <strong className="text-gray-900">{hoverData.page_view}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: COLORS.click_zalo }} />
                    <span className="text-gray-600">Click Zalo:</span>
                    <strong className="text-gray-900">{hoverData.click_zalo}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: COLORS.click_call }} />
                    <span className="text-gray-600">Click Call:</span>
                    <strong className="text-gray-900">{hoverData.click_call}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
          <p className="mt-2 text-center text-[11px] text-gray-400">
            Đưa chuột vào biểu đồ để xem chi tiết từng ngày
          </p>
        </div>
      )}
    </div>
  );
}
