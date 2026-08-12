import { describe, expect, test } from "bun:test";
import {
  addDaysToDateString,
  buildDispatchWindowFromForm,
  differenceInDays,
  parseTimeToMinutes,
  DISPATCH_WINDOW_END_HOUR,
  DISPATCH_WINDOW_START_HOUR,
} from "./dispatchWindows";

describe("parseTimeToMinutes", () => {
  test("parses valid HH:MM", () => {
    expect(parseTimeToMinutes("08:30")).toBe(510);
    expect(parseTimeToMinutes("14:00")).toBe(840);
  });

  test("returns null for invalid input", () => {
    expect(parseTimeToMinutes("bad")).toBeNull();
    expect(parseTimeToMinutes("12")).toBeNull();
  });
});

describe("differenceInDays", () => {
  test("returns non-negative day count in Lagos calendar", () => {
    expect(differenceInDays("2026-08-01", "2026-08-03")).toBe(2);
    expect(differenceInDays("2026-08-05", "2026-08-01")).toBe(0);
  });
});

describe("addDaysToDateString", () => {
  test("adds days to YYYY-MM-DD", () => {
    expect(addDaysToDateString("2026-08-01", 2)).toBe("2026-08-03");
  });
});

describe("buildDispatchWindowFromForm", () => {
  test("rejects start time before dispatch window opens", () => {
    const result = buildDispatchWindowFromForm({
      date: "2030-01-15",
      startTime: "07:00",
      durationMinutes: 60,
    });
    expect(result.window).toBeUndefined();
    expect(result.errors.some((e) => e.includes("8:00am"))).toBe(true);
  });

  test("rejects window ending after dispatch cutoff", () => {
    const lastStartHour = DISPATCH_WINDOW_END_HOUR - 1;
    const result = buildDispatchWindowFromForm({
      date: "2030-01-15",
      startTime: `${String(lastStartHour).padStart(2, "0")}:30`,
      durationMinutes: 120,
    });
    expect(result.window).toBeUndefined();
    expect(result.errors.some((e) => e.includes("2:00pm"))).toBe(true);
  });

  test("accepts valid future window", () => {
    const result = buildDispatchWindowFromForm({
      date: "2030-06-01",
      startTime: `${String(DISPATCH_WINDOW_START_HOUR).padStart(2, "0")}:00`,
      durationMinutes: 60,
    });
    expect(result.errors).toEqual([]);
    expect(result.window?.start).toContain("2030-06-01");
    expect(result.window?.end).toContain("2030-06-01");
  });
});
