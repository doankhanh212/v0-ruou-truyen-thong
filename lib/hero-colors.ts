export type HeroColorPreset = {
  id: string;
  label: string;
  className: string;
  swatch: string;
  /** Hex pair for the "custom" picker initial state — first is "from", second is "to". */
  hexPair: [string, string];
};

export const HERO_COLOR_PRESETS: HeroColorPreset[] = [
  {
    id: "blue",
    label: "Xanh dương cổ điển",
    className: "bg-gradient-to-br from-[#003b7a] via-[#004a99] to-[#2b6cb0]",
    swatch: "linear-gradient(135deg,#003b7a,#2b6cb0)",
    hexPair: ["#003b7a", "#2b6cb0"],
  },
  {
    id: "red",
    label: "Đỏ rượu sang trọng",
    className: "bg-gradient-to-br from-[#8B1A1A] via-[#6f1414] to-[#4a0e0e]",
    swatch: "linear-gradient(135deg,#8B1A1A,#4a0e0e)",
    hexPair: ["#8B1A1A", "#4a0e0e"],
  },
  {
    id: "amber",
    label: "Vàng nâu cổ truyền",
    className: "bg-gradient-to-br from-[#92400e] via-[#78350f] to-[#451a03]",
    swatch: "linear-gradient(135deg,#92400e,#451a03)",
    hexPair: ["#92400e", "#451a03"],
  },
  {
    id: "emerald",
    label: "Xanh ngọc tươi mát",
    className: "bg-gradient-to-br from-[#065f46] via-[#047857] to-[#064e3b]",
    swatch: "linear-gradient(135deg,#065f46,#064e3b)",
    hexPair: ["#065f46", "#064e3b"],
  },
  {
    id: "purple",
    label: "Tím hoàng gia",
    className: "bg-gradient-to-br from-[#4c1d95] via-[#5b21b6] to-[#3b0764]",
    swatch: "linear-gradient(135deg,#4c1d95,#3b0764)",
    hexPair: ["#4c1d95", "#3b0764"],
  },
  {
    id: "slate",
    label: "Đen xám hiện đại",
    className: "bg-gradient-to-br from-[#1f2937] via-[#111827] to-[#030712]",
    swatch: "linear-gradient(135deg,#1f2937,#030712)",
    hexPair: ["#1f2937", "#030712"],
  },
];

export const DEFAULT_HERO_COLOR: Record<string, string> = {
  "gioi-thieu": "blue",
  "lien-he": "red",
  "tin-tuc": "blue",
};

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Parse `custom:#hex1,#hex2` saved value into the two hex stops. */
export function parseCustomHeroColor(value: string): [string, string] | null {
  if (!value || !value.startsWith("custom:")) return null;
  const rest = value.slice("custom:".length).trim();
  const parts = rest.split(",").map((s) => s.trim());
  if (parts.length !== 2) return null;
  if (!HEX_RE.test(parts[0]) || !HEX_RE.test(parts[1])) return null;
  return [parts[0], parts[1]];
}

export function serializeCustomHeroColor(from: string, to: string): string {
  return `custom:${from},${to}`;
}

/**
 * Returns either:
 *   - { className: "bg-gradient-..." } for preset ids
 *   - { style: { backgroundImage: "linear-gradient(...)" } } for custom hex pairs
 */
export function getHeroColorStyle(
  id: string | undefined | null,
  fallback = "blue",
): { className: string; style: React.CSSProperties } {
  const value = (id || "").trim();
  const custom = parseCustomHeroColor(value);
  if (custom) {
    return {
      className: "",
      style: { backgroundImage: `linear-gradient(135deg, ${custom[0]}, ${custom[1]})` },
    };
  }
  const preset =
    HERO_COLOR_PRESETS.find((p) => p.id === value) ||
    HERO_COLOR_PRESETS.find((p) => p.id === fallback) ||
    HERO_COLOR_PRESETS[0];
  return { className: preset.className, style: {} };
}

/** Legacy helper — kept for callers that only need a className string. */
export function getHeroColorClass(id: string | undefined | null, fallback = "blue"): string {
  return getHeroColorStyle(id, fallback).className;
}
