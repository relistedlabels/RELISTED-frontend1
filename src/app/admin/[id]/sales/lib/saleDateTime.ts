/** Format ISO string for `<input type="datetime-local" />` (local time). */
export function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Parse datetime-local value to ISO string for API. */
export function datetimeLocalToIso(value: string): string {
  if (!value.trim()) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

export function formatSalePhaseLabel(
  phase: "off" | "upcoming" | "live" | "ended",
): string {
  switch (phase) {
    case "live":
      return "Live now";
    case "upcoming":
      return "Scheduled";
    case "ended":
      return "Ended";
    default:
      return "Paused";
  }
}

export function phaseBadgeClass(
  phase: "off" | "upcoming" | "live" | "ended",
): string {
  switch (phase) {
    case "live":
      return "bg-green-100 text-green-800";
    case "upcoming":
      return "bg-blue-100 text-blue-800";
    case "ended":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-amber-100 text-amber-800";
  }
}
