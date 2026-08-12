import { describe, expect, test } from "bun:test";
import { availabilityToListingTypes, listOrEmpty } from "./listingFilters";
import { countActiveListingFilters } from "./countActiveListingFilters";

describe("listOrEmpty", () => {
  test("returns empty array for undefined", () => {
    expect(listOrEmpty(undefined)).toEqual([]);
  });
});

describe("availabilityToListingTypes", () => {
  test("maps UI labels to listing type codes", () => {
    expect(availabilityToListingTypes(["Rent", "Resale"])).toEqual([
      "RENTAL",
      "RESALE",
    ]);
  });

  test("returns undefined for empty selection", () => {
    expect(availabilityToListingTypes([])).toBeUndefined();
    expect(availabilityToListingTypes(undefined)).toBeUndefined();
  });
});

describe("countActiveListingFilters", () => {
  test("counts array and scalar filters", () => {
    expect(
      countActiveListingFilters({
        category: ["dresses"],
        tags: ["vintage", "silk"],
        brand: ["gucci"],
        condition: "good",
        minPrice: 1000,
      }),
    ).toBe(6);
  });

  test("returns zero for empty filters", () => {
    expect(countActiveListingFilters({})).toBe(0);
  });
});
