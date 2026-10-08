import { describe, expect, test } from "bun:test";
import {
  ALL_LISTING_TYPES,
  BUY_LISTING_TYPES,
  isShopBuyMode,
  isShopDefaultSort,
  isShopRentMode,
  RENT_LISTING_TYPES,
  removeShopFilterChip,
  shopListingTypesParam,
  shopSortFromSearchParams,
  shouldPreserveShopHeading,
  syncShopHeadingParams,
} from "./shopBrowse";

describe("shopListingTypesParam", () => {
  test("defaults to all listing types when param is missing", () => {
    const params = new URLSearchParams();
    expect(shopListingTypesParam(params)).toBe(ALL_LISTING_TYPES.toUpperCase());
  });

  test("defaults to buy listing types when buy mode is active", () => {
    const params = new URLSearchParams(`listingType=${BUY_LISTING_TYPES}`);
    expect(shopListingTypesParam(params)).toBe(BUY_LISTING_TYPES.toUpperCase());
    expect(isShopBuyMode(params)).toBe(true);
    expect(isShopRentMode(params)).toBe(false);
  });

  test("recognizes explicit rent mode", () => {
    const params = new URLSearchParams(`listingType=${RENT_LISTING_TYPES}`);
    expect(shopListingTypesParam(params)).toBe(
      RENT_LISTING_TYPES.toUpperCase(),
    );
    expect(isShopRentMode(params)).toBe(true);
    expect(isShopBuyMode(params)).toBe(false);
  });

  test("supports an explicit all listing mode", () => {
    const params = new URLSearchParams(`listingType=${ALL_LISTING_TYPES}`);
    expect(shopListingTypesParam(params)).toBe(ALL_LISTING_TYPES.toUpperCase());
    expect(isShopRentMode(params)).toBe(false);
    expect(isShopBuyMode(params)).toBe(false);
  });

  test("accepts lowercase URL listing types for API filters", () => {
    const params = new URLSearchParams("listingType=rental,rent_or_resale");
    expect(shopListingTypesParam(params)).toBe("RENTAL,RENT_OR_RESALE");
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
