/** User-facing rental length, e.g. "1 Day" or "3 Days". */
export function formatRentalDuration(days: number): string {
  const n = Math.max(0, Math.trunc(Number(days) || 0));
  return n === 1 ? "1 Day" : `${n} Days`;
}
