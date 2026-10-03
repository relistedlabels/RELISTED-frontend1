const LAGOS_TZ = "Africa/Lagos";

export type ReturnDueItem = {
  returnDueDate?: string | null;
  rentalEndDate?: string | null;
};

const lagosDateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: LAGOS_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getLagosCalendarDateKey(date: Date): string {
  return lagosDateFmt.format(date);
}

export function resolveReturnDueDateFromItems(
  items: ReturnDueItem[] | null | undefined,
): string | null {
  let earliest: Date | null = null;

  for (const item of items ?? []) {
    let candidate: Date | null = null;
    if (item.returnDueDate) {
      candidate = new Date(item.returnDueDate);
    } else if (item.rentalEndDate) {
      candidate = new Date(item.rentalEndDate);
      candidate.setDate(candidate.getDate() + 1);
    }
    if (!candidate || Number.isNaN(candidate.getTime())) continue;
    if (!earliest || candidate < earliest) earliest = candidate;
  }

  return earliest?.toISOString() ?? null;
}

export function isReturnDueToday(
  returnDueIso: string | null | undefined,
  now = new Date(),
): boolean {
  if (!returnDueIso) return false;
  const due = new Date(returnDueIso);
  if (Number.isNaN(due.getTime())) return false;
  return getLagosCalendarDateKey(due) === getLagosCalendarDateKey(now);
}

/** True from the return window day onward (today or overdue in Lagos). */
export function isReturnWindowDayOrPast(
  returnDueIso: string | null | undefined,
  now = new Date(),
): boolean {
  if (!returnDueIso) return false;
  const due = new Date(returnDueIso);
  if (Number.isNaN(due.getTime())) return false;
  const dueKey = getLagosCalendarDateKey(due);
  const todayKey = getLagosCalendarDateKey(now);
  return dueKey <= todayKey;
}

export function formatReturnDueHeadline(
  returnDueIso: string | null | undefined,
  now = new Date(),
): string {
  if (!returnDueIso) return "Return due";
  if (isReturnDueToday(returnDueIso, now)) return "Return due today";
  if (isReturnWindowDayOrPast(returnDueIso, now)) return "Return overdue";
  const label = new Date(returnDueIso).toLocaleDateString("en-NG", {
    timeZone: LAGOS_TZ,
    month: "short",
    day: "numeric",
  });
  return `Return due ${label}`;
}

export function shouldPromoteReturnOnDetail(input: {
  status?: string;
  showStartReturn?: boolean;
  returnSubmitted?: boolean;
  items?: ReturnDueItem[];
}): {
  promote: boolean;
  returnDueDate: string | null;
  isDueToday: boolean;
  isOverdue: boolean;
  headline: string;
} {
  const empty = {
    promote: false,
    returnDueDate: null,
    isDueToday: false,
    isOverdue: false,
    headline: "Return due",
  };

  if (input.returnSubmitted || !input.showStartReturn) return empty;

  const statusKey = String(input.status ?? "")
    .toUpperCase()
    .replace(/-/g, "_");
  const returnDueDate = resolveReturnDueDateFromItems(input.items);
  const isDueToday = isReturnDueToday(returnDueDate);
  const windowActive =
    statusKey === "RETURN_DUE" || isReturnWindowDayOrPast(returnDueDate);
  const isOverdue =
    statusKey === "RETURN_DUE" ||
    (Boolean(returnDueDate) &&
      isReturnWindowDayOrPast(returnDueDate) &&
      !isDueToday);

  if (windowActive) {
    return {
      promote: true,
      returnDueDate,
      isDueToday,
      isOverdue,
      headline: formatReturnDueHeadline(returnDueDate),
    };
  }

  return {
    promote: true,
    returnDueDate,
    isDueToday: false,
    isOverdue: false,
    headline: "Ready to return",
  };
}

/** List cards: highlight whenever the renter can start a return. */
export function shouldPromoteReturnOnListOrder(input: {
  status?: string;
  showStartReturn?: boolean;
}): boolean {
  return Boolean(input.showStartReturn);
}

export function isReturnDueUrgentOnListOrder(input: {
  status?: string;
  showStartReturn?: boolean;
}): boolean {
  if (!input.showStartReturn) return false;
  const statusKey = String(input.status ?? "")
    .toUpperCase()
    .replace(/-/g, "_");
  return statusKey === "RETURN_DUE";
}
