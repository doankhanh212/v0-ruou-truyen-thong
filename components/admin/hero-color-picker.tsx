"use client";

import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { CheckCircle2, Paintbrush, Palette } from "lucide-react";
import {
  HERO_COLOR_PRESETS,
  parseCustomHeroColor,
  serializeCustomHeroColor,
} from "@/lib/hero-colors";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function HeroColorPicker({ value, onChange }: Props) {
  const custom = parseCustomHeroColor(value);
  const isCustom = custom !== null;

  const [fromHex, setFromHex] = useState(custom?.[0] ?? "#003b7a");
  const [toHex, setToHex] = useState(custom?.[1] ?? "#2b6cb0");
  const [openPicker, setOpenPicker] = useState<"from" | "to" | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync external value → local hex state when switching back to custom from outside
  useEffect(() => {
    const parsed = parseCustomHeroColor(value);
    if (parsed) {
      setFromHex(parsed[0]);
      setToHex(parsed[1]);
      return;
    }

    const preset = HERO_COLOR_PRESETS.find((p) => p.id === value);
    if (preset) {
      setFromHex(preset.hexPair[0]);
      setToHex(preset.hexPair[1]);
    }
  }, [value]);

  // Close popover on outside click
  useEffect(() => {
    if (!openPicker) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpenPicker(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openPicker]);

  function applyCustom(from: string, to: string) {
    onChange(serializeCustomHeroColor(from, to));
  }

  function handleEnableCustom() {
    applyCustom(fromHex, toHex);
  }

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
        <Palette size={12} /> Màu nền banner
      </label>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {HERO_COLOR_PRESETS.map((preset) => {
          const isActive = !isCustom && value === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.id)}
              title={preset.label}
              aria-label={preset.label}
              aria-pressed={isActive}
              className={`group relative flex aspect-[4/3] items-end overflow-hidden rounded-lg ring-2 ring-offset-2 transition-all ${
                isActive ? "ring-[#8B1A1A]" : "ring-transparent hover:ring-gray-300"
              }`}
              style={{ background: preset.swatch }}
            >
              <span className="w-full bg-black/35 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {preset.label.split(" ")[0]}
              </span>
              {isActive && (
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#8B1A1A] shadow">
                  <CheckCircle2 size={14} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom color builder */}
      <div className="mt-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Paintbrush size={13} className="text-amber-700" />
            <span className="text-xs font-bold text-amber-900">Tùy chỉnh màu riêng</span>
          </div>
          {!isCustom && (
            <button
              type="button"
              onClick={handleEnableCustom}
              className="rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
            >
              Bật tùy chỉnh
            </button>
          )}
          {isCustom && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/70 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
              <CheckCircle2 size={11} /> Đang dùng
            </span>
          )}
        </div>

        <div ref={popoverRef} className="relative mt-3 grid grid-cols-2 gap-3">
          {/* From color */}
          <div>
            <p className="mb-1 text-[11px] font-semibold text-gray-700">Màu bắt đầu</p>
            <button
              type="button"
              onClick={() => setOpenPicker(openPicker === "from" ? null : "from")}
              className="flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs hover:border-gray-400"
            >
              <span
                className="h-6 w-6 flex-shrink-0 rounded border border-gray-200"
                style={{ background: fromHex }}
              />
              <span className="font-mono text-gray-700">{fromHex.toUpperCase()}</span>
            </button>
            {openPicker === "from" && (
              <div className="absolute left-0 top-full z-30 mt-2 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
                <HexColorPicker
                  color={fromHex}
                  onChange={(c) => {
                    setFromHex(c);
                    applyCustom(c, toHex);
                  }}
                />
                <input
                  type="text"
                  value={fromHex}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFromHex(v);
                    if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) {
                      applyCustom(v, toHex);
                    }
                  }}
                  className="mt-2 w-full rounded border border-gray-300 px-2 py-1 font-mono text-xs"
                />
              </div>
            )}
          </div>

          {/* To color */}
          <div>
            <p className="mb-1 text-[11px] font-semibold text-gray-700">Màu kết thúc</p>
            <button
              type="button"
              onClick={() => setOpenPicker(openPicker === "to" ? null : "to")}
              className="flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs hover:border-gray-400"
            >
              <span
                className="h-6 w-6 flex-shrink-0 rounded border border-gray-200"
                style={{ background: toHex }}
              />
              <span className="font-mono text-gray-700">{toHex.toUpperCase()}</span>
            </button>
            {openPicker === "to" && (
              <div className="absolute right-0 top-full z-30 mt-2 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
                <HexColorPicker
                  color={toHex}
                  onChange={(c) => {
                    setToHex(c);
                    applyCustom(fromHex, c);
                  }}
                />
                <input
                  type="text"
                  value={toHex}
                  onChange={(e) => {
                    const v = e.target.value;
                    setToHex(v);
                    if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) {
                      applyCustom(fromHex, v);
                    }
                  }}
                  className="mt-2 w-full rounded border border-gray-300 px-2 py-1 font-mono text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Gradient preview */}
        <div
          className="mt-3 h-8 rounded-md ring-1 ring-black/5"
          style={{ background: `linear-gradient(135deg, ${fromHex}, ${toHex})` }}
        />
      </div>
    </div>
  );
}
