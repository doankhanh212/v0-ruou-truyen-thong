export type HeaderColorPreset = {
  id: string;
  label: string;
  className: string;
  swatch: string;
  defaultHex: string;
  defaultHexTo?: string;
  textTone: "dark" | "light";
};

export const HEADER_COLOR_PRESETS: HeaderColorPreset[] = [
  {
    id: "white",
    label: "Trắng",
    className: "bg-white",
    swatch: "#ffffff",
    defaultHex: "#ffffff",
    textTone: "dark",
  },
  { id: "blue", label: "Xanh dương", className: "bg-[#2b6cb0]", swatch: "#2b6cb0", defaultHex: "#2b6cb0", textTone: "light" },
  { id: "navy", label: "Xanh navy", className: "bg-[#003b7a]", swatch: "#003b7a", defaultHex: "#003b7a", textTone: "light" },
  { id: "red", label: "Đỏ rượu", className: "bg-[#8B1A1A]", swatch: "#8B1A1A", defaultHex: "#8B1A1A", textTone: "light" },
  { id: "amber", label: "Nâu vàng", className: "bg-[#78350f]", swatch: "#78350f", defaultHex: "#78350f", textTone: "light" },
  { id: "emerald", label: "Xanh ngọc", className: "bg-[#065f46]", swatch: "#065f46", defaultHex: "#065f46", textTone: "light" },
  { id: "slate", label: "Đen xám", className: "bg-[#1f2937]", swatch: "#1f2937", defaultHex: "#1f2937", textTone: "light" },
  { id: "purple", label: "Tím", className: "bg-[#4c1d95]", swatch: "#4c1d95", defaultHex: "#4c1d95", textTone: "light" },
  {
    id: "gradient-blue",
    label: "Gradient xanh",
    className: "bg-gradient-to-r from-[#003b7a] to-[#2b6cb0]",
    swatch: "linear-gradient(90deg,#003b7a,#2b6cb0)",
    defaultHex: "#003b7a",
    defaultHexTo: "#2b6cb0",
    textTone: "light",
  },
  {
    id: "gradient-red",
    label: "Gradient đỏ",
    className: "bg-gradient-to-r from-[#8B1A1A] to-[#4a0e0e]",
    swatch: "linear-gradient(90deg,#8B1A1A,#4a0e0e)",
    defaultHex: "#8B1A1A",
    defaultHexTo: "#4a0e0e",
    textTone: "light",
  },
];

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export type CustomHeaderColor =
  | { kind: "solid"; from: string }
  | { kind: "gradient"; from: string; to: string };

export function parseCustomHeaderColor(value: string): CustomHeaderColor | null {
  if (!value || !value.startsWith("custom:")) return null;
  const parts = value
    .slice("custom:".length)
    .split(",")
    .map((s) => s.trim());
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

export function serializeCustomHeaderColor(c: CustomHeaderColor): string {
  return c.kind === "solid" ? `custom:${c.from}` : `custom:${c.from},${c.to}`;
}

function expandHex(hex: string) {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return clean
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  return clean;
}

function luminance(hex: string) {
  const clean = expandHex(hex);
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function customTextTone(custom: CustomHeaderColor): "dark" | "light" {
  const value =
    custom.kind === "solid"
      ? luminance(custom.from)
      : (luminance(custom.from) + luminance(custom.to)) / 2;
  return value > 0.68 ? "dark" : "light";
}

export function getHeaderColorStyle(
  id: string | undefined | null,
  fallback = "white",
): { className: string; style: React.CSSProperties; textTone: "dark" | "light" } {
  const value = (id || "").trim();
  const custom = parseCustomHeaderColor(value);
  if (custom) {
    if (custom.kind === "solid") {
      return {
        className: "",
        style: { backgroundColor: custom.from },
        textTone: customTextTone(custom),
      };
    }
    return {
      className: "",
      style: { backgroundImage: `linear-gradient(90deg, ${custom.from}, ${custom.to})` },
      textTone: customTextTone(custom),
    };
  }
  const preset =
    HEADER_COLOR_PRESETS.find((p) => p.id === value) ||
    HEADER_COLOR_PRESETS.find((p) => p.id === fallback) ||
    HEADER_COLOR_PRESETS[0];
  return { className: preset.className, style: {}, textTone: preset.textTone };
}
