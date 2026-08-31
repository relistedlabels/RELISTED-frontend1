import { describe, expect, test } from "bun:test";
import {
  buildProductAvailabilityPath,
  canDeactivateListing,
  LIVE_ADMIN_LISTING_STATUSES,
} from "./listingDeactivate";

describe("LIVE_ADMIN_LISTING_STATUSES", () => {
  test("treats AVAILABLE and APPROVED as equivalent live listing statuses", () => {
    expect(LIVE_ADMIN_LISTING_STATUSES).toEqual(["AVAILABLE", "APPROVED"]);
  });
});

describe("canDeactivateListing", () => {
  test.each(LIVE_ADMIN_LISTING_STATUSES)(
    "allows deactivation when status is %s",
    (status) => {
      expect(canDeactivateListing(status)).toBe(true);
      expect(canDeactivateListing(status.toLowerCase())).toBe(true);
    },
  );

  test("blocks deactivation for non-live statuses", () => {
    for (const status of [
      "PENDING",
      "REJECTED",
      "RENTED",
      "UNAVAILABLE",
      "SOLD",
    ]) {
      expect(canDeactivateListing(status)).toBe(false);
    }
    expect(canDeactivateListing(undefined)).toBe(false);
    expect(canDeactivateListing(null)).toBe(false);
  });
});

describe("admin deactivate contract parity", () => {
  test("every live admin listing status is eligible for deactivation UI", () => {
    for (const status of LIVE_ADMIN_LISTING_STATUSES) {
      expect(canDeactivateListing(status)).toBe(true);
    }
  });
});

describe("buildProductAvailabilityPath", () => {
  test("targets the shared product availability endpoint", () => {
    expect(buildProductAvailabilityPath("prod-123")).toBe(
      "/product/prod-123/availability",
    );
  });
});
