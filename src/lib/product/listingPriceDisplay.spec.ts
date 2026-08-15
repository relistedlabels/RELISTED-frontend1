import { describe, expect, test } from "bun:test";
import {
  listingPriceDisplay,
  normalizeListingType,
} from "./listingPriceDisplay";

describe("normalizeListingType", () => {
  test("maps resale variants", () => {
    expect(normalizeListingType("resale")).toBe("RESALE");
    expect(normalizeListingType("RESALE")).toBe("RESALE");
  });

  test("maps rent-or-resale variants", () => {
    expect(normalizeListingType("RENT_OR_RESALE")).toBe("RENT_OR_RESALE");
    expect(normalizeListingType("RENT-RESALE")).toBe("RENT_OR_RESALE");
  });

  test("defaults to rental", () => {
    expect(normalizeListingType(null)).toBe("RENTAL");
    expect(normalizeListingType(undefined)).toBe("RENTAL");
    expect(normalizeListingType("unknown")).toBe("RENTAL");
  });
});

describe("listingPriceDisplay", () => {
  test("shows resale price only for resale listings", () => {
    const result = listingPriceDisplay({
      listingType: "RESALE",
      dailyPrice: 500,
      resalePrice: 12000,
    });
    expect(result.primary).toEqual({ label: "Resale Price", amount: 12000 });
    expect(result.secondary).toBeNull();
  });

  test("shows rent and resale for dual listings", () => {
    const result = listingPriceDisplay({
      listingType: "RENT_OR_RESALE",
      dailyPrice: 800,
      resalePrice: 15000,
    });
    expect(result.primary).toEqual({ label: "Rent price", amount: 800 });
    expect(result.secondary).toEqual({ label: "Resale", amount: 15000 });
  });

  test("shows daily price for rental listings", () => {
    const result = listingPriceDisplay({
      listingType: "RENTAL",
      dailyPrice: 650,
    });
    expect(result.primary).toEqual({ label: "Price/Day", amount: 650 });
    expect(result.secondary).toBeNull();
  });
});
