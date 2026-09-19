const LAGOS_TIME_ZONE = "Africa/Lagos";
const LAGOS_OFFSET = "+01:00";
const SLOT_INTERVAL_MINUTES = 30;

const displayDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: LAGOS_TIME_ZONE,
  month: "short",
  day: "numeric",
});

const displayDateWithWeekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: LAGOS_TIME_ZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
});

const displayTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: LAGOS_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: LAGOS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const isoDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: LAGOS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const pad = (value: number) => value.toString().padStart(2, "0");

const ensureDate = (input: string | Date): Date =>
  typeof input === "string" ? new Date(input) : input;

export const getLagosDateString = (input: string | Date): string =>
  isoDateFormatter.format(ensureDate(input));

export const getTodayInLagos = () => getLagosDateString(new Date());

const lagosWallClockPartsFromDate = (
  d: Date,
): { date: string; hour: number; minute: number; minutesFromMidnight: number } => {
  const map: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
  for (const p of isoDateTimeFormatter.formatToParts(d)) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  const year = map.year ?? "1970";
  const month = map.month ?? "01";
  const day = map.day ?? "01";
  const hour = Number.parseInt(map.hour ?? "0", 10);
  const minute = Number.parseInt(map.minute ?? "0", 10);
  return {
    date: `${year}-${month}-${day}`,
    hour,
    minute,
    minutesFromMidnight: hour * 60 + minute,
  };
};

/** Calendar date and clock time in Africa/Lagos for this instant (not UTC). */
export const getLagosDateTimeParts = (
  input: string | Date,
): { date: string; hour: number; minute: number; minutesFromMidnight: number } => {
  if (typeof input !== "string") {
    return lagosWallClockPartsFromDate(ensureDate(input));
  }

  const trimmed = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T00:00:00${LAGOS_OFFSET}`);
    return lagosWallClockPartsFromDate(d);
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return lagosWallClockPartsFromDate(parsed);
  }

  const parts = trimmed.split(/[-T:]/);
  if (parts.length >= 3) {
    const y = Number.parseInt(parts[0] ?? "", 10);
    const mo = Number.parseInt(parts[1] ?? "", 10);
    const dayNum = Number.parseInt(parts[2] ?? "", 10);
    const h = parts.length > 3 ? Number.parseInt(parts[3] ?? "0", 10) : 0;
    const min = parts.length > 4 ? Number.parseInt(parts[4] ?? "0", 10) : 0;
    if (![y, mo, dayNum].some((n) => Number.isNaN(n))) {
      const d = new Date(
        `${pad(y)}-${pad(mo)}-${pad(dayNum)}T${pad(h)}:${pad(min)}:00${LAGOS_OFFSET}`,
      );
      if (!Number.isNaN(d.getTime())) return lagosWallClockPartsFromDate(d);
    }
  }

  return lagosWallClockPartsFromDate(new Date());
};

const buildIsoFromDateAndMinutes = (
  dateString: string,
  minutesFromMidnight: number,
): string => {
  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;
  return `${dateString}T${pad(hours)}:${pad(minutes)}:00${LAGOS_OFFSET}`;
};

const roundToSlot = (minutes: number) => {
  // Round to nearest hour: if minutes >= 30, round up; else round down
  const hourMinutes = minutes % 60;
  if (hourMinutes >= 30) {
    return minutes + (60 - hourMinutes); // round up to next hour
  } else {
    return minutes - hourMinutes; // round down to current hour
  }
};

/** Lexicographic max for YYYY-MM-DD Lagos calendar strings. */
const lagosCalendarMax = (a: string, b: string): string => (a < b ? b : a);

export const addDaysToDateString = (dateString: string, days: number): string => {
  const trimmed = dateString.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (m) {
    const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00${LAGOS_OFFSET}`);
    d.setTime(d.getTime() + days * 86400000);
    return getLagosDateString(d);
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return dateString;
  parsed.setTime(parsed.getTime() + days * 86400000);
  return getLagosDateString(parsed);
};

export const differenceInDays = (start: string, end: string): number => {
  const startDate = new Date(`${start}T00:00:00${LAGOS_OFFSET}`);
  const endDate = new Date(`${end}T00:00:00${LAGOS_OFFSET}`);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(0, Math.round(diff / (24 * 60 * 60 * 1000)));
};

const minutesUntil = (targetIso: string) => {
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  return Math.round((target - now) / 60000);
};

export const DISPATCH_WINDOW_START_HOUR = 8;
/** Last hour deliveries and pickups may end (Lagos). Default slots may start up to their duration before this. */
export const DISPATCH_WINDOW_END_HOUR = 18;
export const MIN_DISPATCH_WINDOW_MINUTES = 60;
export const DEFAULT_DISPATCH_WINDOW_MINUTES = 120;
export const MAX_DISPATCH_WINDOW_MINUTES = 240;
export const IMMEDIATE_DISPATCH_THRESHOLD_MINUTES = 60;

export type ShipmentDispatchType = "OUTBOUND" | "RETURN" | "RESALE";

export interface DispatchWindow {
  start: string;
  end: string;
}

export type DispatchWindowsPayload = Partial<
  Record<ShipmentDispatchType, DispatchWindow>
>;

export interface DerivedDispatchWindow {
  window: DispatchWindow;
  baseDate: string;
  scheduledDate: string;
  rolledForwardDays: number;
}

export interface DispatchWindowSelection {
  type: ShipmentDispatchType;
  window: DispatchWindow;
  mode: "DEFAULT" | "CUSTOM";
  baseDate: string;
  scheduledDate: string;
  rolledForwardDays: number;
}

export type DispatchWindowSelectionMap = Partial<
  Record<ShipmentDispatchType, DispatchWindowSelection>
>;

export type DispatchWindowContext = {
  type: ShipmentDispatchType;
  title: string;
  subtitle: string;
  baseDateLabel?: string;
  baseDateReason?: string;
  defaultSummary?: string;
  allowDateChange?: boolean;
  minDate?: string;
  helperText?: string;
  suggested: DerivedDispatchWindow;
  lockedWindow?: DispatchWindow;
};

type DispatchContextCopy = {
  title: string;
  subtitle: string;
  baseDateReason: string;
  helperText?: string;
};

const DEFAULT_CONTEXT_COPY: Record<ShipmentDispatchType, DispatchContextCopy> = {
  OUTBOUND: {
    title: "Courier pickup from lister",
    subtitle: "Book when our rider collects the item from the lister so it can head to you on time.",
    baseDateReason: "Anchored to your rental start date",
    helperText:
      "Pick the hour we collect from the lister. We’ll immediately route the courier to you after this window.",
  },
  RETURN: {
    title: "Courier pickup from you",
    subtitle: "Book when the rider comes to your address to collect the item for return.",
    baseDateReason: "Anchored to your return day",
    helperText: "Choose the hour that works for handoff so we can close out your rental smoothly.",
  },
  RESALE: {
    title: "Resale delivery options",
    subtitle: "Tell us when you’d like this purchase dropped off.",
    baseDateReason: "Defaults to the next available same-day slot",
    helperText:
      "We’ll release the order for immediate dispatch if your slot starts within the next hour.",
  },
};

export interface DispatchContextDescriptor {
  type: ShipmentDispatchType;
  baseDate: string | Date;
  title?: string;
  subtitle?: string;
  baseDateLabel?: string;
  baseDateReason?: string;
  helperText?: string;
  allowDateChange?: boolean;
  minDate?: string;
  allowRollForward?: boolean;
  durationMinutes?: number;
  defaultSummary?: string;
}

const DEFAULT_ALLOW_ROLL_FORWARD: Record<ShipmentDispatchType, boolean> = {
  OUTBOUND: false,
  RETURN: false,
  RESALE: true,
};

export const buildDispatchWindowContexts = (
  descriptors: DispatchContextDescriptor[],
): DispatchWindowContext[] => {
  return descriptors.map((descriptor) => {
    const copy = DEFAULT_CONTEXT_COPY[descriptor.type];
    const suggested = deriveDefaultDispatchWindow(descriptor.baseDate, {
      allowRollForward:
        descriptor.allowRollForward ?? DEFAULT_ALLOW_ROLL_FORWARD[descriptor.type],
      durationMinutes: descriptor.durationMinutes,
    });

    const baseDateLabel = descriptor.baseDateLabel
      ? descriptor.baseDateLabel
      : formatLagosDate(descriptor.baseDate, { includeWeekday: true });

    return {
      type: descriptor.type,
      title: descriptor.title ?? copy.title,
      subtitle: descriptor.subtitle ?? copy.subtitle,
      baseDateLabel,
      baseDateReason: descriptor.baseDateReason ?? copy.baseDateReason,
      helperText: descriptor.helperText ?? copy.helperText,
      allowDateChange: descriptor.allowDateChange,
      minDate: descriptor.minDate ?? suggested.scheduledDate,
      suggested,
      defaultSummary:
        descriptor.defaultSummary ?? formatWindowRange(suggested.window),
    } satisfies DispatchWindowContext;
  });
};

export const formatLagosDate = (
  input: string | Date,
  options?: { includeWeekday?: boolean },
): string => {
  const formatter = options?.includeWeekday
    ? displayDateWithWeekdayFormatter
    : displayDateFormatter;
  return formatter.format(ensureDate(input));
};

export const formatLagosTime = (input: string | Date): string =>
  displayTimeFormatter.format(ensureDate(input));

export const formatWindowRange = (window: DispatchWindow): string => {
  return `${formatLagosDate(window.start, { includeWeekday: true })}, ${formatLagosTime(
    window.start,
  )} – ${formatLagosTime(window.end)}`;
};

const clampDuration = (minutes: number): number => {
  if (minutes < MIN_DISPATCH_WINDOW_MINUTES) return MIN_DISPATCH_WINDOW_MINUTES;
  if (minutes > MAX_DISPATCH_WINDOW_MINUTES) return MAX_DISPATCH_WINDOW_MINUTES;
  return minutes;
};

export const deriveDefaultDispatchWindow = (
  baseDateIso: string | Date,
  options?: {
    durationMinutes?: number;
    /** Ignored: we always roll to the next day when no slot fits on the current day. */
    allowRollForward?: boolean;
    minLeadMinutes?: number;
  },
): DerivedDispatchWindow => {
  const duration = clampDuration(
    options?.durationMinutes ?? DEFAULT_DISPATCH_WINDOW_MINUTES,
  );
  const minLeadMinutes = options?.minLeadMinutes ?? MIN_DISPATCH_WINDOW_MINUTES;
  const baseParts = getLagosDateTimeParts(baseDateIso);
  const nowParts = getLagosDateTimeParts(new Date());

  const dayStart = DISPATCH_WINDOW_START_HOUR * 60;
  const dayEnd = DISPATCH_WINDOW_END_HOUR * 60;

  // Never schedule on a Lagos calendar day before "today" (fixes local rental date vs Lagos midnight).
  const initialCursor = lagosCalendarMax(baseParts.date, nowParts.date);
  let rolled = differenceInDays(baseParts.date, initialCursor);
  let dateCursor = initialCursor;
  let preferredStart =
    dateCursor === baseParts.date
      ? Math.max(baseParts.minutesFromMidnight, dayStart)
      : dayStart;

  for (let i = 0; i < 7; i += 1) {
    const isSameDay = dateCursor === nowParts.date;
    // Round to nearest hour: if minutes >= 30, round up; else round down
    let candidateStart = preferredStart;
    const currentHourMinutes = candidateStart % 60;
    if (currentHourMinutes >= 30) {
      candidateStart += 60 - currentHourMinutes; // round up to next hour
    } else {
      candidateStart -= currentHourMinutes; // round down to current hour
    }
    candidateStart = Math.max(candidateStart, dayStart);

    // For same-day windows, ensure the rounded time is at least the current time
    // Don't apply additional lead time - just use the rounded hour
    if (isSameDay && candidateStart < nowParts.minutesFromMidnight) {
      candidateStart = nowParts.minutesFromMidnight;
    }

    const lastAllowedStart = dayEnd - duration;

    // If rounding pushed us past the last allowed start, round down instead
    if (candidateStart > lastAllowedStart && currentHourMinutes >= 30) {
      // Try rounding down instead of up
      candidateStart = preferredStart - currentHourMinutes;
      candidateStart = Math.max(candidateStart, dayStart);
    }

    // No room left on this calendar day (or same-day lead pushed us past last start) → next day.
    // Do not clamp to lastAllowedStart: that can yield a window that is already over or impossible.
    if (candidateStart > lastAllowedStart) {
      dateCursor = addDaysToDateString(dateCursor, 1);
      preferredStart = dayStart;
      rolled += 1;
      continue;
    }

    const startIso = buildIsoFromDateAndMinutes(dateCursor, candidateStart);
    const endIso = buildIsoFromDateAndMinutes(dateCursor, candidateStart + duration);
    return {
      window: { start: startIso, end: endIso },
      baseDate: getLagosDateString(baseDateIso),
      scheduledDate: dateCursor,
      rolledForwardDays: rolled,
    };
  }

  const fallbackStart = buildIsoFromDateAndMinutes(
    dateCursor,
    Math.max(dayStart, (DISPATCH_WINDOW_END_HOUR - 1) * 60),
  );
  return {
    window: {
      start: fallbackStart,
      end: buildIsoFromDateAndMinutes(
        dateCursor,
        (DISPATCH_WINDOW_END_HOUR - 1) * 60 + duration,
      ),
    },
    baseDate: getLagosDateString(baseDateIso),
    scheduledDate: dateCursor,
    rolledForwardDays: rolled,
  };
};

export interface BuildDispatchWindowParams {
  date: string; // YYYY-MM-DD in Lagos
  startTime: string; // HH:MM 24h
  durationMinutes: number;
}

export interface DispatchWindowBuildResult {
  window?: DispatchWindow;
  errors: string[];
}

export const parseTimeToMinutes = (value: string): number | null => {
  const [hoursStr, minutesStr] = value.split(":");
  if (hoursStr === undefined || minutesStr === undefined) return null;
  const hours = Number.parseInt(hoursStr, 10);
  const minutes = Number.parseInt(minutesStr, 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

export const buildDispatchWindowFromForm = (
  params: BuildDispatchWindowParams,
): DispatchWindowBuildResult => {
  const errors: string[] = [];
  const startMinutes = parseTimeToMinutes(params.startTime);
  if (startMinutes === null) {
    return { errors: ["Select a valid start time"] };
  }

  const dayStart = DISPATCH_WINDOW_START_HOUR * 60;
  const dayEnd = DISPATCH_WINDOW_END_HOUR * 60;
  const duration = clampDuration(params.durationMinutes);

  if (duration < MIN_DISPATCH_WINDOW_MINUTES || duration > MAX_DISPATCH_WINDOW_MINUTES) {
    errors.push("Window must be between 60 and 240 minutes");
  }

  const formatCutoffLabel = (hour: number) => {
    const h = hour % 12 || 12;
    const meridiem = hour >= 12 ? "pm" : "am";
    return `${h}:00${meridiem}`;
  };

  if (startMinutes < dayStart) {
    errors.push(
      `Start time must be after ${formatCutoffLabel(DISPATCH_WINDOW_START_HOUR)}`,
    );
  }

  const endMinutes = startMinutes + duration;

  if (endMinutes > dayEnd) {
    errors.push(
      `Window must end by ${formatCutoffLabel(DISPATCH_WINDOW_END_HOUR)}`,
    );
  }

  const today = getLagosDateString(new Date());
  if (params.date === today) {
    const minStartToday = roundToSlot(
      getLagosDateTimeParts(new Date()).minutesFromMidnight +
        MIN_DISPATCH_WINDOW_MINUTES,
    );
    const lastStart = dayEnd - duration;
    if (minStartToday > lastStart) {
      errors.push(
        "No dispatch windows left today. Pick tomorrow or a later date.",
      );
    } else if (startMinutes < minStartToday) {
      errors.push("Same-day windows need at least 1 hour notice");
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    window: {
      start: buildIsoFromDateAndMinutes(params.date, startMinutes),
      end: buildIsoFromDateAndMinutes(params.date, endMinutes),
    },
    errors,
  };
};

/** A slot starting at `slotStartMinutes` (minutes from midnight, Lagos) is valid on `dateStr`. */
export const isDispatchSlotStartValidOnLagosDate = (
  dateStr: string,
  slotStartMinutes: number,
  durationMinutes: number = DEFAULT_DISPATCH_WINDOW_MINUTES,
): boolean => {
  const dayStart = DISPATCH_WINDOW_START_HOUR * 60;
  const dayEnd = DISPATCH_WINDOW_END_HOUR * 60;
  const duration = clampDuration(durationMinutes);
  const lastStart = dayEnd - duration;
  if (slotStartMinutes < dayStart || slotStartMinutes > lastStart) return false;
  const today = getLagosDateString(new Date());
  if (dateStr !== today) return true;
  const nowParts = getLagosDateTimeParts(new Date());
  const minStart = roundToSlot(
    nowParts.minutesFromMidnight + MIN_DISPATCH_WINDOW_MINUTES,
  );
  return slotStartMinutes >= minStart;
};

/** True if at least one dispatch slot exists on this Lagos calendar day (same-day lead applies). */
export const dayHasDispatchSlotOnLagosDate = (
  dateStr: string,
  durationMinutes: number = DEFAULT_DISPATCH_WINDOW_MINUTES,
  slotStepMinutes: number = 60,
): boolean => {
  const dayStart = DISPATCH_WINDOW_START_HOUR * 60;
  const dayEnd = DISPATCH_WINDOW_END_HOUR * 60;
  const duration = clampDuration(durationMinutes);
  const lastStart = dayEnd - duration;
  for (let m = dayStart; m <= lastStart; m += slotStepMinutes) {
    if (isDispatchSlotStartValidOnLagosDate(dateStr, m, duration)) return true;
  }
  return false;
};

/**
 * Lagos YYYY-MM-DD to use as the default rental-start highlight on the calendar.
 * Lighter than a full “min selectable date” scan: only checks whether **today**
 * (Lagos) still has at least one valid dispatch slot; if not, suggests tomorrow.
 */
export const getSuggestedRentalCalendarStartYmd = (
  durationMinutes: number = DEFAULT_DISPATCH_WINDOW_MINUTES,
): string => {
  const today = getTodayInLagos();
  if (dayHasDispatchSlotOnLagosDate(today, durationMinutes)) return today;
  return addDaysToDateString(today, 1);
};

export const isImmediateDispatch = (
  startIso: string,
  thresholdMinutes = IMMEDIATE_DISPATCH_THRESHOLD_MINUTES,
): boolean => {
  const mins = minutesUntil(startIso);
  return mins >= 0 && mins <= thresholdMinutes;
};

export type DispatchWindowChoice = {
  value: string;
  label: string;
  window: DispatchWindow;
  isEarliest?: boolean;
};

const listHourlySlotStartMinutes = (
  durationMinutes: number = DEFAULT_DISPATCH_WINDOW_MINUTES,
): number[] => {
  const dayStart = DISPATCH_WINDOW_START_HOUR * 60;
  const dayEnd = DISPATCH_WINDOW_END_HOUR * 60;
  const duration = clampDuration(durationMinutes);
  const lastStart = dayEnd - duration;
  const slots: number[] = [];
  for (let minutes = dayStart; minutes <= lastStart; minutes += 60) {
    slots.push(minutes);
  }
  return slots;
};

const windowsEqual = (a: DispatchWindow, b: DispatchWindow) =>
  a.start === b.start && a.end === b.end;

/** User-facing label for the earliest same-day window (may start before the hour grid). */
export const formatEarliestWindowChoiceLabel = (window: DispatchWindow): string =>
  `${formatLagosTime(window.start)} – ${formatLagosTime(window.end)}`;

const formatHourlySlotLabel = (
  dateStr: string,
  startMinutes: number,
  durationMinutes: number = DEFAULT_DISPATCH_WINDOW_MINUTES,
) => {
  const endMinutes = startMinutes + durationMinutes;
  const toTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
      .toString()
      .padStart(2, "0");
    const mins = (minutes % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}`;
  };
  const start = formatLagosTime(`${dateStr}T${toTime(startMinutes)}:00+01:00`);
  const end = formatLagosTime(`${dateStr}T${toTime(endMinutes)}:00+01:00`);
  return `${start} – ${end}`;
};

/**
 * Dropdown choices for a Lagos calendar day: earliest available window first,
 * then remaining hourly slots. Same-day "immediate" windows that fall between
 * hour marks get their own first option (e.g. 3:03 PM – 4:03 PM).
 */
export const buildDispatchWindowChoices = (
  dateStr: string,
  suggestedWindow: DispatchWindow,
  durationMinutes: number = DEFAULT_DISPATCH_WINDOW_MINUTES,
): DispatchWindowChoice[] => {
  const choices: DispatchWindowChoice[] = [];
  const suggestedOnDate = getLagosDateString(suggestedWindow.start) === dateStr;

  if (suggestedOnDate) {
    const suggestedStartParts = getLagosDateTimeParts(suggestedWindow.start);
    const suggestedStartMin =
      suggestedStartParts.hour * 60 + suggestedStartParts.minute;
    const onHourBoundary = suggestedStartMin % 60 === 0;
    const hourlyMatch =
      onHourBoundary &&
      isDispatchSlotStartValidOnLagosDate(
        dateStr,
        suggestedStartMin,
        durationMinutes,
      ) &&
      (() => {
        const hrs = Math.floor(suggestedStartMin / 60)
          .toString()
          .padStart(2, "0");
        const mins = (suggestedStartMin % 60).toString().padStart(2, "0");
        const built = buildDispatchWindowFromForm({
          date: dateStr,
          startTime: `${hrs}:${mins}`,
          durationMinutes,
        }).window;
        return built ? windowsEqual(built, suggestedWindow) : false;
      })();

    if (!hourlyMatch || isImmediateDispatch(suggestedWindow.start)) {
      choices.push({
        value: suggestedWindow.start,
        label: formatEarliestWindowChoiceLabel(suggestedWindow),
        window: suggestedWindow,
        isEarliest: true,
      });
    }
  }

  for (const startMin of listHourlySlotStartMinutes(durationMinutes)) {
    if (!isDispatchSlotStartValidOnLagosDate(dateStr, startMin, durationMinutes)) {
      continue;
    }
    const hrs = Math.floor(startMin / 60)
      .toString()
      .padStart(2, "0");
    const mins = (startMin % 60).toString().padStart(2, "0");
    const built = buildDispatchWindowFromForm({
      date: dateStr,
      startTime: `${hrs}:${mins}`,
      durationMinutes,
    }).window;
    if (!built) continue;
    if (choices.some((choice) => windowsEqual(choice.window, built))) continue;
    choices.push({
      value: built.start,
      label: formatHourlySlotLabel(dateStr, startMin, durationMinutes),
      window: built,
    });
  }

  if (choices.length === 0 && suggestedOnDate) {
    choices.push({
      value: suggestedWindow.start,
      label: formatEarliestWindowChoiceLabel(suggestedWindow),
      window: suggestedWindow,
      isEarliest: true,
    });
  }

  return choices;
};
