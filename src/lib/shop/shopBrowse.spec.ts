import { describe, expect, test } from "bun:test";
import {
  BUY_LISTING_TYPES,
  isShopDefaultSort,
  removeShopFilterChip,
  RENT_LISTING_TYPES,
  shouldPreserveShopHeading,
  shopListingTypesParam,
  shopSortFromSearchParams,
  syncShopHeadingParams,
} from "./shopBrowse";

describe("shopListingTypesParam", () => {
  test("defaults to rent listing types when param is missing", () => {
    const params = new URLSearchParams();
    expect(shopListingTypesParam(params)).toBe(RENT_LISTING_TYPES);
  });

  test("defaults to buy listing types when buy mode is active", () => {
    const params = new URLSearchParams(`listingType=${BUY_LISTING_TYPES}`);
    expect(shopListingTypesParam(params)).toBe(BUY_LISTING_TYPES);
  });
});

describe("shouldPreserveShopHeading", () => {
  test("preserves heading on sale pages", () => {
    const params = new URLSearchParams(
      "sale=summer-sale&title=Summer%20Sale&description=Shop%20the%20sale",
    );
    expect(shouldPreserveShopHeading(params)).toBe(true);
  });

  test("does not preserve heading on category-only pages", () => {
    const params = new URLSearchParams(
      "category=abc&title=Dresses&description=Shop%20Dresses",
    );
    expect(shouldPreserveShopHeading(params)).toBe(false);
  });
});

describe("syncShopHeadingParams", () => {
  test("keeps sale heading when removing the last stacked category", () => {
    const params = new URLSearchParams(
      "sale=summer-sale&title=Summer%20Sale&category=abc&category=def",
    );
    params.delete("category");
    syncShopHeadingParams(params);
    expect(params.get("title")).toBe("Summer Sale");
    expect(params.get("sale")).toBe("summer-sale");
  });

  test("clears category heading when no discovery filters remain", () => {
    const params = new URLSearchParams(
      "category=abc&title=Dresses&description=Shop%20Dresses",
    );
    params.delete("category");
    syncShopHeadingParams(params);
    expect(params.get("title")).toBeNull();
    expect(params.get("description")).toBeNull();
  });
});

describe("removeShopFilterChip", () => {
  test("removes one color from comma-separated color param", () => {
    const params = new URLSearchParams(
      "color=Emerald,Burgundy&category=abc&title=Bottoms",
    );
    const next = removeShopFilterChip(params, {
      key: "color-Emerald",
      label: "Emerald",
      removeKeys: ["color"],
      removeValue: "Emerald",
    });
    expect(next.get("color")).toBe("Burgundy");
  });

  test("does not strip sale heading when removing a category chip", () => {
    const params = new URLSearchParams(
      "sale=summer-sale&title=Summer%20Sale&category=abc",
    );
    const next = removeShopFilterChip(params, {
      key: "category-abc",
      label: "Dresses",
      removeKeys: ["category"],
      removeValue: "abc",
    });
    expect(next.get("sale")).toBe("summer-sale");
    expect(next.get("title")).toBe("Summer Sale");
    expect(next.getAll("category")).toEqual([]);
  });
});

describe("isShopDefaultSort", () => {
  test("treats missing sort as default", () => {
    expect(isShopDefaultSort(new URLSearchParams())).toBe(true);
  });

  test("detects non-default sort", () => {
    const params = new URLSearchParams("sort=price_high");
    expect(isShopDefaultSort(params)).toBe(false);
    expect(shopSortFromSearchParams(params)).toBe("price_high");
  });
});
