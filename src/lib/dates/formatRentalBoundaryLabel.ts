const LAGOS_TIME_ZONE = "Africa/Lagos";
const LAGOS_OFFSET = "+01:00";

function coerceLagosDate(input: string): Date | null {
  const t = input.trim();
  if (!t) return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (dateOnly) {
    const [, y, mo, d] = dateOnly;
    const dt = new Date(`${y}-${mo}-${d}T00:00:00${LAGOS_OFFSET}`);
    return Number.isFinite(dt.getTime()) ? dt : null;
  }
  const dt = new Date(t);
  return Number.isFinite(dt.getTime()) ? dt : null;
}

/**
 * Date-only `YYYY-MM-DD` → Lagos calendar date.
 * ISO datetimes → Lagos local date + time.
 */
export function formatRentalBoundaryLabel(
  input: string | null | undefined,
): string {
  if (input == null) return "";
  const dt = coerceLagosDate(String(input));
  if (!dt) return String(input).trim();

  const hasTime =
    String(input).includes("T") || /:\d{2}/.test(String(input));

  if (!hasTime) {
    return dt.toLocaleDateString("en-NG", {
      timeZone: LAGOS_TIME_ZONE,
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return dt.toLocaleString("en-NG", {
    timeZone: LAGOS_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
