export const APPAREL_SIZE_UNITS = ["EU", "UK", "US"] as const;

export type ApparelSizeUnit = (typeof APPAREL_SIZE_UNITS)[number];

export const APPAREL_SIZE_OPTIONS: Record<ApparelSizeUnit, string[]> = {
  EU: Array.from({ length: 39 }, (_, i) => {
    const size = 32 + Math.floor(i / 2);
    return `${size}${i % 2 === 0 ? "" : ".5"}`;
  }),
  UK: Array.from({ length: 35 }, (_, i) => {
    const size = 1 + Math.floor(i / 2);
    return `${size}${i % 2 === 0 ? "" : ".5"}`;
  }),
  US: Array.from({ length: 35 }, (_, i) => {
    const size = 2 + Math.floor(i / 2);
    return `${size}${i % 2 === 0 ? "" : ".5"}`;
  }),
};

export function parseApparelSize(value: string): {
  size: string;
  unit: ApparelSizeUnit | null;
} {
  const normalized = value.trim().toUpperCase();
  const match = normalized.match(/^(.+?)[\s-]+(EU|UK|US)$/);
  return match
    ? { size: match[1]!.trim(), unit: match[2] as ApparelSizeUnit }
    : { size: value, unit: null };
}

export function formatApparelSize(size: string, unit: ApparelSizeUnit): string {
  return `${size}-${unit}`;
}

export function normalizeApparelSizeFilter(value: string): string {
  const parsed = parseApparelSize(value);
  return parsed.unit ? formatApparelSize(parsed.size, parsed.unit) : value;
}
