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

export const getLagosDateTimeParts = (
  input: string | Date,
): { date: string; hour: number; minute: number; minutesFromMidnight: number } => {
  const ensureDateObj = (inp: string | Date): Date => {
    if (typeof inp === "string") {
      const parts = inp.split(/[-T:]/);
      if (parts.length >= 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const h = parts.length > 3 ? parseInt(parts[3], 10) : 0;
        const min = parts.length > 4 ? parseInt(parts[4], 10) : 0;
        return new Date(Date.UTC(y, m, d, h, min));
      }
      const parsed = new Date(inp);
      if (!isNaN(parsed.getTime())) return parsed;
      return new Date();
    }
    return inp;
  };
  const date = ensureDateObj(input);
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  return {
    date: dateStr,
    hour,
    minute,
    minutesFromMidnight: hour * 60 + minute,
  };
};

const buildIsoFromDateAndMinutes = (
  dateString: string,
  minutesFromMidnight: number,
): string => {
  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;
  return `${dateString}T${pad(hours)}:${pad(minutes)}:00${LAGOS_OFFSET}`;
};

const roundToSlot = (minutes: number) =>
  Math.ceil(minutes / SLOT_INTERVAL_MINUTES) * SLOT_INTERVAL_MINUTES;

export const addDaysToDateString = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const newDate = new Date(Date.UTC(y, m, d));
      newDate.setUTCDate(newDate.getUTCDate() + days);
      const year = newDate.getUTCFullYear();
      const month = (newDate.getUTCMonth() + 1).toString().padStart(2, "0");
      const day = newDate.getUTCDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return dateString;
  }
  date.setUTCDate(date.getUTCDate() + days);
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
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
export const DISPATCH_WINDOW_END_HOUR = 14;
export const MIN_DISPATCH_WINDOW_MINUTES = 60;
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
    title: "Resale delivery window",
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
  )} – ${formatLagosTime(window.end)} WAT`;
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
    allowRollForward?: boolean;
    minLeadMinutes?: number;
  },
): DerivedDispatchWindow => {
  const duration = clampDuration(options?.durationMinutes ?? 60);
  const allowRollForward = options?.allowRollForward ?? true;
  const minLeadMinutes = options?.minLeadMinutes ?? MIN_DISPATCH_WINDOW_MINUTES;
  const baseParts = getLagosDateTimeParts(baseDateIso);
  const nowParts = getLagosDateTimeParts(new Date());

  const dayStart = DISPATCH_WINDOW_START_HOUR * 60;
  const dayEnd = DISPATCH_WINDOW_END_HOUR * 60;

  let preferredStart = Math.max(baseParts.minutesFromMidnight, dayStart);
  let dateCursor = baseParts.date;
  let rolled = 0;

  for (let i = 0; i < 7; i += 1) {
    const isSameDay = dateCursor === nowParts.date;
    let candidateStart = roundToSlot(preferredStart);
    candidateStart = Math.max(candidateStart, dayStart);

    if (isSameDay) {
      const minStartForToday = roundToSlot(
        nowParts.minutesFromMidnight + minLeadMinutes,
      );
      candidateStart = Math.max(candidateStart, minStartForToday);
    }

    const lastAllowedStart = dayEnd - duration;

    if (candidateStart > lastAllowedStart) {
      if (allowRollForward) {
        dateCursor = addDaysToDateString(dateCursor, 1);
        preferredStart = dayStart;
        rolled += 1;
        continue;
      }
      candidateStart = lastAllowedStart;
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
        (DISPATCH_WINDOW_END_HOUR - 1) * 60 + MIN_DISPATCH_WINDOW_MINUTES,
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

  if (startMinutes < dayStart) {
    errors.push("Start time must be after 8:00am WAT");
  }

  const endMinutes = startMinutes + duration;

  if (endMinutes > dayEnd) {
    errors.push("Window must end by 2:00pm WAT");
  }

  const today = getLagosDateString(new Date());
  if (params.date === today && startMinutes < roundToSlot(getLagosDateTimeParts(new Date()).minutesFromMidnight + MIN_DISPATCH_WINDOW_MINUTES)) {
    errors.push("Same-day windows need at least 1 hour notice");
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

export const isImmediateDispatch = (
  startIso: string,
  thresholdMinutes = IMMEDIATE_DISPATCH_THRESHOLD_MINUTES,
): boolean => {
  const mins = minutesUntil(startIso);
  return mins >= 0 && mins <= thresholdMinutes;
};
