/** Format ISO string for `<input type="datetime-local" />` (local time). */
export function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export type DatetimeLocalParts = {
  date: string;
  hour: string;
  minute: string;
};

/** Split a datetime-local value into date and time parts. */
export function splitDatetimeLocal(
  value: string | null | undefined,
): DatetimeLocalParts | null {
  if (!value?.includes("T")) return null;
  const [date, time] = value.split("T");
  if (!date) return null;
  const [hour = "00", minute = "00"] = (time ?? "").split(":");
  return {
    date,
    hour: hour.padStart(2, "0").slice(0, 2),
    minute: minute.padStart(2, "0").slice(0, 2),
  };
}

/** Combine date and time parts into a datetime-local value. */
export function joinDatetimeLocal(parts: DatetimeLocalParts): string {
  return `${parts.date}T${parts.hour.padStart(2, "0")}:${parts.minute.padStart(2, "0")}`;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function dayWithOrdinal(day: number): string {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

function formatBannerDate(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${dayWithOrdinal(d.getDate())}`;
}

/** Banner subheadline from schedule, e.g. "June 1st - June 3rd". */
export function formatSaleBannerDateLine(
  startLocal: string,
  endLocal: string,
): string {
  const startParts = splitDatetimeLocal(startLocal);
  const endParts = splitDatetimeLocal(endLocal);
  if (!startParts?.date || !endParts?.date) return "";

  const start = new Date(joinDatetimeLocal(startParts));
  const end = new Date(joinDatetimeLocal(endParts));
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";

  if (start.toDateString() === end.toDateString()) {
    return formatBannerDate(start);
  }
  return `${formatBannerDate(start)} - ${formatBannerDate(end)}`;
}

/** Format hour for select labels (e.g. "10:00 AM"). */
export function formatHourMinuteLabel(hour: string, minute: string): string {
  const d = new Date(2000, 0, 1, Number(hour), Number(minute));
  if (Number.isNaN(d.getTime())) return `${hour}:${minute}`;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

/** Parse datetime-local value to ISO string for API. */
export function datetimeLocalToIso(value: string): string {
  if (!value.trim()) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

/** Human-readable schedule label for admin tables and summaries. */
export function formatSaleScheduleDisplay(
  iso: string | null | undefined,
): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
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
