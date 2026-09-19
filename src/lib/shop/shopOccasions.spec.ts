import { describe, expect, test } from "bun:test";
import { shopOccasionsFromFilterOptions } from "./shopOccasions";
import { EMPTY_LISTING_FILTER_OPTIONS } from "./listingFilterOptions";

describe("shopOccasionsFromFilterOptions", () => {
  test("returns only occasions with matching inventory tags", () => {
    const occasions = shopOccasionsFromFilterOptions({
      ...EMPTY_LISTING_FILTER_OPTIONS,
      tags: [
        { id: "1", name: "Night Out" },
        { id: "2", name: "Unused Tag" },
      ],
    });

    expect(occasions).toHaveLength(1);
    expect(occasions[0]?.title).toBe("Night Out");
    expect(occasions[0]?.image).toContain("/category/");
  });

  test("returns empty when no tags are in inventory", () => {
    expect(shopOccasionsFromFilterOptions(EMPTY_LISTING_FILTER_OPTIONS)).toEqual(
      [],
    );
  });
});
