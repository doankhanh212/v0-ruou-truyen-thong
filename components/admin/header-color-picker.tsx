"use client";

import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { CheckCircle2, Paintbrush } from "lucide-react";
import {
  HEADER_COLOR_PRESETS,
  parseCustomHeaderColor,
  serializeCustomHeaderColor,
} from "@/lib/header-colors";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function HeaderColorPicker({ value, onChange }: Props) {
  const custom = parseCustomHeaderColor(value);
  const isCustom = custom !== null;
  const [mode, setMode] = useState<"solid" | "gradient">(
    custom?.kind === "gradient" ? "gradient" : "solid",
  );
  const [fromHex, setFromHex] = useState(custom?.from ?? "#ffffff");
  const [toHex, setToHex] = useState(
    custom?.kind === "gradient" ? custom.to : "#003b7a",
  );
  const [openPicker, setOpenPicker] = useState<"from" | "to" | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parsed = parseCustomHeaderColor(value);
    if (parsed) {
      setFromHex(parsed.from);
      if (parsed.kind === "gradient") {
        setToHex(parsed.to);
        setMode("gradient");
      } else {
        setMode("solid");
      }
      return;
    }

    const preset = HEADER_COLOR_PRESETS.find((p) => p.id === value);
    if (preset) {
      setFromHex(preset.defaultHex);
      setToHex(preset.defaultHexTo ?? preset.defaultHex);
      setMode(preset.defaultHexTo ? "gradient" : "solid");
    }
  }, [value]);

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

  function applyCustom(nextMode: "solid" | "gradient", from: string, to: string) {
    onChange(
      nextMode === "solid"
        ? serializeCustomHeaderColor({ kind: "solid", from })
        : serializeCustomHeaderColor({ kind: "gradient", from, to }),
    );
  }

  function setModeAndApply(next: "solid" | "gradient") {
    setMode(next);
    if (isCustom) applyCustom(next, fromHex, toHex);
  }

  const previewStyle: React.CSSProperties =
    mode === "solid"
      ? { backgroundColor: fromHex }
      : { backgroundImage: `linear-gradient(90deg, ${fromHex}, ${toHex})` };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {HEADER_COLOR_PRESETS.map((preset) => {
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
                isActive ? "ring-sky-500" : "ring-transparent hover:ring-slate-300"
              }`}
              style={{ background: preset.swatch }}
            >
              <span
                className={`w-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  preset.textTone === "dark" ? "bg-black/10 text-slate-800" : "bg-black/35 text-white"
                }`}
              >
                {preset.label}
              </span>
              {isActive && (
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-sky-600 shadow">
                  <CheckCircle2 size={14} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl border border-dashed border-sky-300 bg-sky-50/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Paintbrush size={13} className="text-sky-700" />
            <span className="text-xs font-bold text-sky-900">Tùy chỉnh màu riêng</span>
          </div>
          {!isCustom ? (
            <button
              type="button"
              onClick={() => applyCustom(mode, fromHex, toHex)}
              className="rounded-md border border-sky-300 bg-white px-2.5 py-1 text-xs font-semibold text-sky-800 hover:bg-sky-100"
            >
              Bật tùy chỉnh
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-200/70 px-2 py-0.5 text-[11px] font-semibold text-sky-900">
              <CheckCircle2 size={11} /> Đang dùng
            </span>
          )}
        </div>

        <div className="mt-3 inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setModeAndApply("solid")}
            className={`rounded-md px-3 py-1 font-semibold transition-colors ${
              mode === "solid" ? "bg-sky-100 text-sky-800" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Màu đơn
          </button>
          <button
            type="button"
            onClick={() => setModeAndApply("gradient")}
            className={`rounded-md px-3 py-1 font-semibold transition-colors ${
              mode === "gradient" ? "bg-sky-100 text-sky-800" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Gradient 2 màu
          </button>
        </div>

        <div ref={popoverRef} className={`relative mt-3 grid gap-3 ${mode === "gradient" ? "grid-cols-2" : "grid-cols-1"}`}>
          <div>
            <p className="mb-1 text-[11px] font-semibold text-slate-700">
              {mode === "gradient" ? "Màu bắt đầu" : "Màu nền"}
            </p>
            <button
              type="button"
              onClick={() => setOpenPicker(openPicker === "from" ? null : "from")}
              className="flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs hover:border-slate-400"
            >
              <span className="h-6 w-6 flex-shrink-0 rounded border border-slate-200" style={{ background: fromHex }} />
              <span className="font-mono text-slate-700">{fromHex.toUpperCase()}</span>
            </button>
            {openPicker === "from" && (
              <div className="absolute left-0 top-full z-30 mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                <HexColorPicker
                  color={fromHex}
                  onChange={(c) => {
                    setFromHex(c);
                    applyCustom(mode, c, toHex);
                  }}
                />
                <input
                  type="text"
                  value={fromHex}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFromHex(v);
                    if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) {
                      applyCustom(mode, v, toHex);
                    }
                  }}
                  className="mt-2 w-full rounded border border-slate-300 px-2 py-1 font-mono text-xs"
                />
              </div>
            )}
          </div>

          {mode === "gradient" && (
            <div>
              <p className="mb-1 text-[11px] font-semibold text-slate-700">Màu kết thúc</p>
              <button
                type="button"
                onClick={() => setOpenPicker(openPicker === "to" ? null : "to")}
                className="flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs hover:border-slate-400"
              >
                <span className="h-6 w-6 flex-shrink-0 rounded border border-slate-200" style={{ background: toHex }} />
                <span className="font-mono text-slate-700">{toHex.toUpperCase()}</span>
              </button>
              {openPicker === "to" && (
                <div className="absolute right-0 top-full z-30 mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <HexColorPicker
                    color={toHex}
                    onChange={(c) => {
                      setToHex(c);
                      applyCustom(mode, fromHex, c);
                    }}
                  />
                  <input
                    type="text"
                    value={toHex}
                    onChange={(e) => {
                      const v = e.target.value;
                      setToHex(v);
                      if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) {
                        applyCustom(mode, fromHex, v);
                      }
                    }}
                    className="mt-2 w-full rounded border border-slate-300 px-2 py-1 font-mono text-xs"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 h-8 rounded-md ring-1 ring-black/5" style={previewStyle} />
      </div>
    </div>
  );
}
