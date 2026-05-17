"use client";

import { useEffect, useState } from "react";

export type DashboardCard = {
  label: string;
  value: number;
};

export function DashboardStats({ initialCards }: { initialCards: DashboardCard[] }) {
  const [cards, setCards] = useState(initialCards);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          cards?: DashboardCard[];
          updatedAt?: string;
        };
        if (cancelled) return;
        if (Array.isArray(data.cards)) setCards(data.cards);
        if (data.updatedAt) setUpdatedAt(new Date(data.updatedAt));
      } catch {
        // Keep the current numbers if refresh fails.
      }
    }

    void load();
    const timer = window.setInterval(load, 10_000);

    function refreshWhenVisible() {
      if (!document.hidden) void load();
    }

    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  return (
    <div>
      <div className="mb-2 flex justify-end text-[11px] text-gray-400">
        {updatedAt ? `Cập nhật: ${updatedAt.toLocaleTimeString("vi-VN")}` : "Đang đồng bộ..."}
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <div key={card.label} className="rounded border bg-white p-3 sm:p-5">
            <div className="text-[11px] uppercase leading-tight text-gray-500 sm:text-xs">{card.label}</div>
            <div className="mt-1.5 text-xl font-semibold sm:mt-2 sm:text-2xl">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
