import { describe, expect, test } from "bun:test";
import {
  formatListerOrderStatusLabel,
  getListerOrderBadgeClassName,
  getListerOrderBadgeToneFromLabel,
  getListerOrderStatusLabel,
  isListerAvailabilityPending,
  normalizeListerOrderStatusKey,
} from "./listerOrderStatus";

describe("normalizeListerOrderStatusKey", () => {
  test("uppercases and normalizes hyphens", () => {
    expect(normalizeListerOrderStatusKey(" pending-approval ")).toBe(
      "PENDING_APPROVAL",
    );
  });
});

describe("getListerOrderStatusLabel", () => {
  test("prefers availability status when order is pending-shaped", () => {
    expect(
      getListerOrderStatusLabel({
        status: "PENDING",
        availabilityStatus: "EXPIRED",
      }),
    ).toBe("Expired");
  });

  test("uses order status when not pending-shaped", () => {
    expect(
      getListerOrderStatusLabel({
        status: "IN_TRANSIT",
        availabilityStatus: "ACCEPTED",
      }),
    ).toBe("In Transit");
  });

  test("maps known availability labels", () => {
    expect(formatListerOrderStatusLabel("PENDING_LISTER_APPROVAL")).toBe(
      "Pending Approval",
    );
    expect(formatListerOrderStatusLabel("RETURN_DUE")).toBe("Awaiting return");
  });
});

describe("isListerAvailabilityPending", () => {
  test("returns true for pending-shaped statuses", () => {
    expect(
      isListerAvailabilityPending({ status: "PENDING_APPROVAL" }),
    ).toBe(true);
  });

  test("returns false once order moves past approval", () => {
    expect(isListerAvailabilityPending({ status: "IN_TRANSIT" })).toBe(false);
  });
});

describe("getListerOrderBadgeToneFromLabel", () => {
  test("maps green, red, and warning labels", () => {
    expect(getListerOrderBadgeToneFromLabel("Approved")).toBe("success");
    expect(getListerOrderBadgeToneFromLabel("Rejected")).toBe("danger");
    expect(getListerOrderBadgeToneFromLabel("Pending Approval")).toBe("warning");
    expect(getListerOrderBadgeToneFromLabel("Awaiting return")).toBe("warning");
  });

  test("falls back to keyword heuristics", () => {
    expect(getListerOrderBadgeToneFromLabel("Custom Cancelled State")).toBe(
      "danger",
    );
    expect(getListerOrderBadgeToneFromLabel("Custom In Progress")).toBe(
      "success",
    );
  });
});

describe("getListerOrderBadgeClassName", () => {
  test("returns tone-specific classes", () => {
    expect(getListerOrderBadgeClassName("Rejected")).toContain("bg-red-100");
    expect(getListerOrderBadgeClassName("Approved")).toContain("bg-green-100");
  });
});
