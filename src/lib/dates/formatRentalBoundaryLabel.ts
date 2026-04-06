/**
 * Date-only `YYYY-MM-DD` → local calendar date (no time).
 * ISO datetimes → local date + time so e.g. 24h windows that cross midnight show correctly.
 */
export function formatRentalBoundaryLabel(
  input: string | null | undefined,
): string {
  if (input == null) return "";
  const t = String(input).trim();
  if (!t) return "";
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (dateOnly) {
    const [, y, mo, d] = dateOnly;
    const dt = new Date(Number(y), Number(mo) - 1, Number(d));
    return dt.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  const dt = new Date(t);
  if (!Number.isFinite(dt.getTime())) return t;
  return dt.toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
