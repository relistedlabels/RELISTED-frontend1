export type BannerPattern = {
  /** Shown in preview label, e.g. "Adire dots" */
  label: string;
  backgroundImage: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  opacity: number;
};

export type BannerColorPreset = {
  id: string;
  name: string;
  bg: string;
  stripBg: string;
  text: string;
  textMuted: string;
  separator: string;
  divider: string;
  border: string;
  /** Dark banner → light CTA; light banner → dark CTA */
  isDark: boolean;
  pattern?: BannerPattern;
};

export const DEFAULT_BANNER_COLOR_PRESET: BannerColorPreset = {
  id: "default",
  name: "Default (white)",
  bg: "#FFFFFF",
  stripBg: "#F5F5F5",
  text: "#000000",
  textMuted: "rgba(0, 0, 0, 0.55)",
  separator: "rgba(0, 0, 0, 0.2)",
  divider: "rgba(0, 0, 0, 0.25)",
  border: "rgba(0, 0, 0, 0.1)",
  isDark: false,
};

const adireDotsDark: BannerPattern = {
  label: "Adire dots",
  backgroundImage:
    "radial-gradient(circle at 1px 1px, rgba(250, 250, 248, 0.1) 1px, transparent 0)",
  backgroundSize: "14px 14px",
  opacity: 1,
};

const adireDotsLight: BannerPattern = {
  label: "Adire dots",
  backgroundImage:
    "radial-gradient(circle at 1px 1px, rgba(27, 31, 38, 0.07) 1px, transparent 0)",
  backgroundSize: "14px 14px",
  opacity: 1,
};

const mudclothLines: BannerPattern = {
  label: "Mudcloth lines",
  backgroundImage:
    "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(250, 246, 244, 0.07) 10px, rgba(250, 246, 244, 0.07) 11px)",
  opacity: 1,
};

const kenteStripes: BannerPattern = {
  label: "Kente stripes",
  backgroundImage:
    "repeating-linear-gradient(90deg, transparent 0, transparent 22px, rgba(196, 164, 132, 0.12) 22px, rgba(196, 164, 132, 0.12) 23px, transparent 23px, transparent 44px, rgba(255, 255, 255, 0.05) 44px, rgba(255, 255, 255, 0.05) 45px)",
  opacity: 1,
};

const baobabWeave: BannerPattern = {
  label: "Baobab weave",
  backgroundImage: [
    "repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(250, 250, 248, 0.05) 12px, rgba(250, 250, 248, 0.05) 13px)",
    "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(250, 250, 248, 0.04) 12px, rgba(250, 250, 248, 0.04) 13px)",
  ].join(", "),
  opacity: 1,
};

const palmCrosshatch: BannerPattern = {
  label: "Palm crosshatch",
  backgroundImage:
    "repeating-linear-gradient(0deg, transparent, transparent 16px, rgba(250, 250, 248, 0.06) 16px, rgba(250, 250, 248, 0.06) 17px)",
  opacity: 1,
};

/** Wax-print diamond grid (classic Ankara geometry) */
const ankaraDiamonds = (accent: string, accent2?: string): BannerPattern => ({
  label: "Ankara diamonds",
  backgroundImage: [
    `linear-gradient(45deg, ${accent} 25%, transparent 25%)`,
    `linear-gradient(-45deg, ${accent} 25%, transparent 25%)`,
    `linear-gradient(45deg, transparent 75%, ${accent} 75%)`,
    `linear-gradient(-45deg, transparent 75%, ${accent} 75%)`,
    ...(accent2
      ? [
          `radial-gradient(circle at 6px 6px, ${accent2} 1px, transparent 1px)`,
        ]
      : []),
  ].join(", "),
  backgroundSize: accent2 ? "20px 20px, 20px 20px, 20px 20px, 20px 20px, 20px 20px" : "20px 20px, 20px 20px, 20px 20px, 20px 20px",
  backgroundPosition: accent2
    ? "0 0, 0 10px, 10px -10px, -10px 0px, 0 0"
    : "0 0, 0 10px, 10px -10px, -10px 0px",
  opacity: 1,
});

/** Concentric sun discs common on wax prints */
const ankaraSunDiscs = (ring: string, dot: string): BannerPattern => ({
  label: "Ankara sun discs",
  backgroundImage: [
    `radial-gradient(circle at 14px 14px, transparent 5px, ${ring} 6px, transparent 7px)`,
    `radial-gradient(circle at 14px 14px, transparent 10px, ${ring} 11px, transparent 12px)`,
    `radial-gradient(circle at 14px 14px, ${dot} 1.5px, transparent 2px)`,
  ].join(", "),
  backgroundSize: "28px 28px",
  opacity: 1,
});

/** Offset block repeat inspired by Dutch wax layouts */
const ankaraBlocks = (a: string, b: string): BannerPattern => ({
  label: "Ankara blocks",
  backgroundImage: [
    `repeating-linear-gradient(90deg, ${a} 0, ${a} 1px, transparent 1px, transparent 18px)`,
    `repeating-linear-gradient(0deg, ${b} 0, ${b} 1px, transparent 1px, transparent 18px)`,
    `repeating-linear-gradient(45deg, transparent, transparent 8px, ${a} 8px, ${a} 9px)`,
  ].join(", "),
  opacity: 1,
});

/** African-inspired first, then existing palettes. Near-black warm omitted. */
export const BANNER_COLOR_PRESETS: BannerColorPreset[] = [
  {
    id: "ankara-royal",
    name: "Ankara royal",
    bg: "#1A2F5C",
    stripBg: "#142448",
    text: "#FAF6F4",
    textMuted: "rgba(250, 246, 244, 0.65)",
    separator: "rgba(250, 246, 244, 0.25)",
    divider: "rgba(250, 246, 244, 0.3)",
    border: "rgba(255, 200, 87, 0.2)",
    isDark: true,
    pattern: ankaraDiamonds(
      "rgba(255, 200, 87, 0.14)",
      "rgba(255, 140, 90, 0.12)",
    ),
  },
  {
    id: "ankara-sunset",
    name: "Ankara sunset",
    bg: "#7A3B2E",
    stripBg: "#632F24",
    text: "#FFF8F2",
    textMuted: "rgba(255, 248, 242, 0.65)",
    separator: "rgba(255, 248, 242, 0.25)",
    divider: "rgba(255, 248, 242, 0.3)",
    border: "rgba(255, 200, 87, 0.2)",
    isDark: true,
    pattern: ankaraSunDiscs(
      "rgba(255, 200, 87, 0.16)",
      "rgba(255, 248, 242, 0.2)",
    ),
  },
  {
    id: "ankara-garden",
    name: "Ankara garden",
    bg: "#1B4332",
    stripBg: "#143528",
    text: "#F2F5F3",
    textMuted: "rgba(242, 245, 243, 0.65)",
    separator: "rgba(242, 245, 243, 0.25)",
    divider: "rgba(242, 245, 243, 0.3)",
    border: "rgba(230, 126, 90, 0.2)",
    isDark: true,
    pattern: ankaraBlocks(
      "rgba(230, 126, 90, 0.12)",
      "rgba(255, 200, 87, 0.1)",
    ),
  },
  {
    id: "ankara-wax-light",
    name: "Ankara wax (light)",
    bg: "#F5EBD8",
    stripBg: "#EBDFC8",
    text: "#1B1F26",
    textMuted: "rgba(27, 31, 38, 0.55)",
    separator: "rgba(27, 31, 38, 0.2)",
    divider: "rgba(27, 31, 38, 0.25)",
    border: "rgba(122, 59, 46, 0.15)",
    isDark: false,
    pattern: ankaraDiamonds(
      "rgba(122, 59, 46, 0.1)",
      "rgba(26, 47, 92, 0.08)",
    ),
  },
  {
    id: "adire-indigo",
    name: "Adire indigo",
    bg: "#1E2A44",
    stripBg: "#151E32",
    text: "#F5F3EF",
    textMuted: "rgba(245, 243, 239, 0.65)",
    separator: "rgba(245, 243, 239, 0.25)",
    divider: "rgba(245, 243, 239, 0.3)",
    border: "rgba(255, 255, 255, 0.1)",
    isDark: true,
    pattern: adireDotsDark,
  },
  {
    id: "laterite-clay",
    name: "Laterite clay",
    bg: "#5C3D31",
    stripBg: "#4A3028",
    text: "#FAF6F4",
    textMuted: "rgba(250, 246, 244, 0.65)",
    separator: "rgba(250, 246, 244, 0.25)",
    divider: "rgba(250, 246, 244, 0.3)",
    border: "rgba(255, 255, 255, 0.1)",
    isDark: true,
    pattern: mudclothLines,
  },
  {
    id: "savanna-olive",
    name: "Savanna olive",
    bg: "#3D4A32",
    stripBg: "#2F3928",
    text: "#FAFAF8",
    textMuted: "rgba(250, 250, 248, 0.65)",
    separator: "rgba(250, 250, 248, 0.25)",
    divider: "rgba(250, 250, 248, 0.3)",
    border: "rgba(255, 255, 255, 0.1)",
    isDark: true,
    pattern: kenteStripes,
  },
  {
    id: "baobab-bark",
    name: "Baobab bark",
    bg: "#4A3F35",
    stripBg: "#3A322A",
    text: "#FAFAF8",
    textMuted: "rgba(250, 250, 248, 0.65)",
    separator: "rgba(250, 250, 248, 0.25)",
    divider: "rgba(250, 250, 248, 0.3)",
    border: "rgba(255, 255, 255, 0.1)",
    isDark: true,
    pattern: baobabWeave,
  },
  {
    id: "ochre-wash",
    name: "Ochre wash",
    bg: "#F0E2C8",
    stripBg: "#E5D4B5",
    text: "#231F20",
    textMuted: "rgba(35, 31, 32, 0.55)",
    separator: "rgba(35, 31, 32, 0.2)",
    divider: "rgba(35, 31, 32, 0.25)",
    border: "rgba(35, 31, 32, 0.1)",
    isDark: false,
    pattern: adireDotsLight,
  },
  {
    id: "laterite-sand",
    name: "Laterite sand",
    bg: "#E8DDD0",
    stripBg: "#DDD0C0",
    text: "#1B1F26",
    textMuted: "rgba(27, 31, 38, 0.55)",
    separator: "rgba(27, 31, 38, 0.2)",
    divider: "rgba(27, 31, 38, 0.25)",
    border: "rgba(27, 31, 38, 0.1)",
    isDark: false,
  },
  {
    id: "palm-forest",
    name: "Palm forest",
    bg: "#1F3D32",
    stripBg: "#172E26",
    text: "#F2F5F3",
    textMuted: "rgba(242, 245, 243, 0.65)",
    separator: "rgba(242, 245, 243, 0.25)",
    divider: "rgba(242, 245, 243, 0.3)",
    border: "rgba(255, 255, 255, 0.1)",
    isDark: true,
    pattern: palmCrosshatch,
  },
  {
    id: "brand-charcoal",
    name: "Brand charcoal",
    bg: "#1B1F26",
    stripBg: "#231F20",
    text: "#FAFAF8",
    textMuted: "rgba(250, 250, 248, 0.65)",
    separator: "rgba(250, 250, 248, 0.25)",
    divider: "rgba(250, 250, 248, 0.3)",
    border: "rgba(255, 255, 255, 0.1)",
    isDark: true,
  },
  {
    id: "warm-olive",
    name: "Warm olive",
    bg: "#3A3A32",
    stripBg: "#33332D",
    text: "#FFFFFF",
    textMuted: "rgba(255, 255, 255, 0.65)",
    separator: "rgba(255, 255, 255, 0.25)",
    divider: "rgba(255, 255, 255, 0.3)",
    border: "rgba(255, 255, 255, 0.1)",
    isDark: true,
  },
  {
    id: "site-cream",
    name: "Site cream",
    bg: "#FAFAF8",
    stripBg: "#F0EDE6",
    text: "#121212",
    textMuted: "rgba(18, 18, 18, 0.55)",
    separator: "rgba(18, 18, 18, 0.2)",
    divider: "rgba(18, 18, 18, 0.25)",
    border: "rgba(0, 0, 0, 0.08)",
    isDark: false,
  },
  {
    id: "soft-black",
    name: "Soft black",
    bg: "#121212",
    stripBg: "#1A1A1A",
    text: "#FFFFFF",
    textMuted: "rgba(255, 255, 255, 0.65)",
    separator: "rgba(255, 255, 255, 0.25)",
    divider: "rgba(255, 255, 255, 0.3)",
    border: "rgba(255, 255, 255, 0.1)",
    isDark: true,
  },
  {
    id: "champagne",
    name: "Champagne",
    bg: "#F3EDE0",
    stripBg: "#E8DFD0",
    text: "#231F20",
    textMuted: "rgba(35, 31, 32, 0.55)",
    separator: "rgba(35, 31, 32, 0.2)",
    divider: "rgba(35, 31, 32, 0.25)",
    border: "rgba(35, 31, 32, 0.1)",
    isDark: false,
  },
  {
    id: "warm-stone",
    name: "Warm stone",
    bg: "#EDE8DF",
    stripBg: "#E2DCD2",
    text: "#1B1F26",
    textMuted: "rgba(27, 31, 38, 0.55)",
    separator: "rgba(27, 31, 38, 0.2)",
    divider: "rgba(27, 31, 38, 0.25)",
    border: "rgba(27, 31, 38, 0.1)",
    isDark: false,
  },
  {
    id: "deep-burgundy",
    name: "Deep burgundy",
    bg: "#3D1F28",
    stripBg: "#2E161E",
    text: "#FAF6F4",
    textMuted: "rgba(250, 246, 244, 0.65)",
    separator: "rgba(250, 246, 244, 0.25)",
    divider: "rgba(250, 246, 244, 0.3)",
    border: "rgba(255, 255, 255, 0.1)",
    isDark: true,
  },
  {
    id: "deep-slate",
    name: "Deep slate",
    bg: "#2A2F38",
    stripBg: "#1E2329",
    text: "#F5F3EF",
    textMuted: "rgba(245, 243, 239, 0.65)",
    separator: "rgba(245, 243, 239, 0.25)",
    divider: "rgba(245, 243, 239, 0.3)",
    border: "rgba(255, 255, 255, 0.1)",
    isDark: true,
  },
  {
    id: "blush",
    name: "Blush",
    bg: "#F0E8E6",
    stripBg: "#E5D8D4",
    text: "#1B1F26",
    textMuted: "rgba(27, 31, 38, 0.55)",
    separator: "rgba(27, 31, 38, 0.2)",
    divider: "rgba(27, 31, 38, 0.25)",
    border: "rgba(27, 31, 38, 0.1)",
    isDark: false,
  },
];

export const BANNER_COLOR_PRESET_COUNT = BANNER_COLOR_PRESETS.length;
