import { describe, expect, test } from "bun:test";
import {
  buildProductAvailabilityPath,
  canDeactivateListing,
} from "./listingDeactivate";

describe("canDeactivateListing", () => {
  test("allows deactivation for live shop statuses", () => {
    expect(canDeactivateListing("AVAILABLE")).toBe(true);
    expect(canDeactivateListing("available")).toBe(true);
    expect(canDeactivateListing("APPROVED")).toBe(true);
  });

  test("blocks deactivation for non-live statuses", () => {
    expect(canDeactivateListing("PENDING")).toBe(false);
    expect(canDeactivateListing("REJECTED")).toBe(false);
    expect(canDeactivateListing("RENTED")).toBe(false);
    expect(canDeactivateListing("UNAVAILABLE")).toBe(false);
    expect(canDeactivateListing("SOLD")).toBe(false);
    expect(canDeactivateListing(undefined)).toBe(false);
    expect(canDeactivateListing(null)).toBe(false);
  });
});

describe("buildProductAvailabilityPath", () => {
  test("targets the shared product availability endpoint", () => {
    expect(buildProductAvailabilityPath("prod-123")).toBe(
      "/product/prod-123/availability",
    );
  });
});
