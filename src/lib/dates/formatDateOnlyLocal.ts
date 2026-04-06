/** YYYY-MM-DD using the local calendar (avoids UTC day shifts from `toISOString()`). */
export function formatDateOnlyLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Add whole calendar days in local time. */
export function addCalendarDaysLocal(d: Date, days: number): Date {
  const out = new Date(d.getTime());
  out.setDate(out.getDate() + days);
  return out;
}
