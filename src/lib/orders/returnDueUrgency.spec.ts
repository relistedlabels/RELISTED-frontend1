import {
  formatReturnDueHeadline,
  isReturnDueToday,
  isReturnWindowDayOrPast,
  resolveReturnDueDateFromItems,
  isReturnDueUrgentOnListOrder,
  shouldPromoteReturnOnDetail,
  shouldPromoteReturnOnListOrder,
} from "./returnDueUrgency";

describe("returnDueUrgency", () => {
  it("resolves the earliest return due date from item fields", () => {
    expect(
      resolveReturnDueDateFromItems([
        { returnDueDate: "2026-09-30T08:00:00.000Z" },
        { rentalEndDate: "2026-09-20T08:00:00.000Z" },
      ]),
    ).toBe("2026-09-21T08:00:00.000Z");
  });

  it("promotes return detail from the return window day onward", () => {
    const now = new Date("2026-09-24T12:00:00.000Z");
    const result = shouldPromoteReturnOnDetail({
      status: "ACTIVE",
      showStartReturn: true,
      returnSubmitted: false,
      items: [{ returnDueDate: "2026-09-24T08:00:00.000Z" }],
    });
    expect(result.promote).toBe(true);
    expect(isReturnDueToday(result.returnDueDate, now)).toBe(true);
    expect(formatReturnDueHeadline(result.returnDueDate, now)).toBe(
      "Return due today",
    );
  });

  it("still promotes actionable returns before the window day", () => {
    const result = shouldPromoteReturnOnDetail({
      status: "ACTIVE",
      showStartReturn: true,
      returnSubmitted: false,
      items: [{ returnDueDate: "2026-12-01T08:00:00.000Z" }],
    });
    expect(result.promote).toBe(true);
    expect(result.headline).toBe("Ready to return");
  });

  it("promotes list cards whenever start return is available", () => {
    expect(
      shouldPromoteReturnOnListOrder({
        status: "RETURN_DUE",
        showStartReturn: true,
      }),
    ).toBe(true);
    expect(
      shouldPromoteReturnOnListOrder({
        status: "ACTIVE",
        showStartReturn: true,
      }),
    ).toBe(true);
    expect(
      isReturnDueUrgentOnListOrder({
        status: "RETURN_DUE",
        showStartReturn: true,
      }),
    ).toBe(true);
  });

  it("does not promote when return is already submitted", () => {
    expect(
      shouldPromoteReturnOnDetail({
        status: "RETURN_DUE",
        showStartReturn: true,
        returnSubmitted: true,
        items: [{ returnDueDate: "2026-09-24T08:00:00.000Z" }],
      }).promote,
    ).toBe(false);
  });

  it("detects overdue windows after the due day", () => {
    const now = new Date("2026-09-25T12:00:00.000Z");
    expect(isReturnWindowDayOrPast("2026-09-24T08:00:00.000Z", now)).toBe(true);
    expect(formatReturnDueHeadline("2026-09-24T08:00:00.000Z", now)).toBe(
      "Return overdue",
    );
  });
});
