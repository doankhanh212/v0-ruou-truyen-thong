"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";

type AnalyticsData = {
  overview: {
    totalViews: number;
    totalZaloClicks: number;
    totalCalls: number;
    conversionRate: number;
  };
  trafficByDay: { date: string; views: number; zalo: number; calls: number }[];
  topProducts: {
    id: number;
    name: string;
    views: number;
    clicks: number;
  }[];
  topPosts: { id: number; title: string; views: number }[];
};

export function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 7), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  });

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/admin/analytics?from=${dateRange.from}&to=${dateRange.to}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<AnalyticsData & { error?: string }>;
      })
      .then((resData) => {
        if (cancelled) return;
        if (resData.error) {
          setError(resData.error);
        } else {
          setData(resData);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message ?? "Không tải được dữ liệu.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dateRange.from, dateRange.to]);

  useEffect(() => {
    return load();
  }, [load]);

  if (loading && !data) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Lỗi tải dữ liệu: {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">Không có dữ liệu.</div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header + date picker */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Báo cáo hiệu quả kinh doanh
        </h1>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
            className="border rounded px-3 py-2 text-sm"
          />
          <span className="text-gray-400">–</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
            className="border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Section 1 — Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Lượt truy cập" value={data.overview.totalViews} />
        <StatCard
          title="Lượt click Zalo"
          value={data.overview.totalZaloClicks}
          color="text-blue-600"
        />
        <StatCard
          title="Lượt gọi Hotline"
          value={data.overview.totalCalls}
          color="text-green-600"
        />
        <StatCard
          title="Tỷ lệ chuyển đổi"
          value={`${data.overview.conversionRate}%`}
          color="text-orange-600"
        />
      </div>

      {/* Section 2 — Line chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-6">Lưu lượng theo ngày</h2>
        <div className="h-80">
          {data.trafficByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.trafficByDay}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#9CA3AF"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Line
                  type="monotone"
                  name="Views"
                  dataKey="views"
                  stroke="#111827"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  name="Click Zalo"
                  dataKey="zalo"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  name="Click Gọi"
                  dataKey="calls"
                  stroke="#16A34A"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Chưa có dữ liệu trong khoảng thời gian này
            </div>
          )}
        </div>
      </div>

      {/* Section 3 & 4 — Top lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopList
          title="Sản phẩm đang Hot"
          items={data.topProducts}
          emptyText="Chưa có lượt click sản phẩm"
        />
        <TopList
          title="Bài viết hiệu quả"
          items={data.topPosts}
          emptyText="Chưa có dữ liệu bài viết"
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color = "text-gray-900",
}: {
  title: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

interface TopItem {
  id: number | string;
  name?: string;
  title?: string;
  views: number;
}

function TopList({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: TopItem[];
  emptyText: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-gray-400 text-sm py-4">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li
              key={item.id}
              className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100"
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs font-bold text-gray-600">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-gray-800 line-clamp-1">
                  {item.name ?? item.title}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                {item.views} views
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
