"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "age_verified";

export function AgeVerificationPopup({ enabled }: { enabled: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    try {
      setVisible(window.localStorage.getItem(STORAGE_KEY) !== "true");
    } catch {
      setVisible(true);
    }
  }, [enabled]);

  if (!enabled || !visible) return null;

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Continue for privacy modes where localStorage is unavailable.
    }
    setVisible(false);
  }

  function decline() {
    window.location.href = "https://www.google.com/";
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-verification-title"
        className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-2xl"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[#2b6cb0]">
          Xác nhận độ tuổi
        </p>
        <h2 id="age-verification-title" className="mt-2 text-2xl font-bold text-slate-950">
          Bạn đã trên 18 tuổi?
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Website có nội dung liên quan đến sản phẩm rượu. Vui lòng xác nhận bạn đủ tuổi theo
          quy định pháp luật để tiếp tục truy cập.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={accept}
            className="min-h-12 rounded-md bg-[#2b6cb0] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#245b96]"
          >
            Tôi đã trên 18 tuổi
          </button>
          <button
            type="button"
            onClick={decline}
            className="min-h-12 rounded-md border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Không
          </button>
        </div>
      </div>
    </div>
  );
}
