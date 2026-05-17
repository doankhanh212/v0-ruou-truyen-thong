export type FooterColorPreset = {
  id: string;
  label: string;
  className: string;
  swatch: string;
  /** Initial hex for the "custom" picker when admin switches from this preset. */
  defaultHex: string;
  /** Optional second hex stop for gradient presets. */
  defaultHexTo?: string;
};

export const FOOTER_COLOR_PRESETS: FooterColorPreset[] = [
  { id: "blue",     label: "Xanh dương",     className: "bg-[#2b6cb0]", swatch: "#2b6cb0", defaultHex: "#2b6cb0" },
  { id: "navy",     label: "Xanh navy",      className: "bg-[#003b7a]", swatch: "#003b7a", defaultHex: "#003b7a" },
  { id: "red",      label: "Đỏ rượu",        className: "bg-[#8B1A1A]", swatch: "#8B1A1A", defaultHex: "#8B1A1A" },
  { id: "amber",    label: "Nâu vàng",       className: "bg-[#78350f]", swatch: "#78350f", defaultHex: "#78350f" },
  { id: "emerald",  label: "Xanh ngọc",      className: "bg-[#065f46]", swatch: "#065f46", defaultHex: "#065f46" },
  { id: "slate",    label: "Đen xám",        className: "bg-[#1f2937]", swatch: "#1f2937", defaultHex: "#1f2937" },
  { id: "purple",   label: "Tím",            className: "bg-[#4c1d95]", swatch: "#4c1d95", defaultHex: "#4c1d95" },
  {
    id: "gradient-blue",
    label: "Gradient xanh",
    className: "bg-gradient-to-r from-[#003b7a] to-[#2b6cb0]",
    swatch: "linear-gradient(90deg,#003b7a,#2b6cb0)",
    defaultHex: "#003b7a",
    defaultHexTo: "#2b6cb0",
  },
  {
    id: "gradient-red",
    label: "Gradient đỏ",
    className: "bg-gradient-to-r from-[#8B1A1A] to-[#4a0e0e]",
    swatch: "linear-gradient(90deg,#8B1A1A,#4a0e0e)",
    defaultHex: "#8B1A1A",
    defaultHexTo: "#4a0e0e",
  },
];

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Custom footer color is serialized as either:
 *   custom:#hex                — solid color
 *   custom:#hex1,#hex2         — left-to-right gradient (90deg)
 */
export type CustomFooterColor =
  | { kind: "solid"; from: string }
  | { kind: "gradient"; from: string; to: string };

export function parseCustomFooterColor(value: string): CustomFooterColor | null {
  if (!value || !value.startsWith("custom:")) return null;
  const rest = value.slice("custom:".length).trim();
  const parts = rest.split(",").map((s) => s.trim());
  if (parts.length === 1) {
    return HEX_RE.test(parts[0]) ? { kind: "solid", from: parts[0] } : null;
  }
  if (parts.length === 2) {
    return HEX_RE.test(parts[0]) && HEX_RE.test(parts[1])
      ? { kind: "gradient", from: parts[0], to: parts[1] }
      : null;
  }
  return null;
}

export function serializeCustomFooterColor(c: CustomFooterColor): string {
  return c.kind === "solid" ? `custom:${c.from}` : `custom:${c.from},${c.to}`;
}

export function getFooterColorStyle(
  id: string | undefined | null,
  fallback = "blue",
): { className: string; style: React.CSSProperties } {
  const value = (id || "").trim();
  const custom = parseCustomFooterColor(value);
  if (custom) {
    if (custom.kind === "solid") {
      return { className: "", style: { backgroundColor: custom.from } };
    }
    return {
      className: "",
      style: { backgroundImage: `linear-gradient(90deg, ${custom.from}, ${custom.to})` },
    };
  }
  const preset =
    FOOTER_COLOR_PRESETS.find((p) => p.id === value) ||
    FOOTER_COLOR_PRESETS.find((p) => p.id === fallback) ||
    FOOTER_COLOR_PRESETS[0];
  return { className: preset.className, style: {} };
}

/** Legacy helper. */
export function getFooterColorClass(id: string | undefined | null, fallback = "blue"): string {
  return getFooterColorStyle(id, fallback).className;
}
