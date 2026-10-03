import { describe, expect, test } from "bun:test";
import {
  isBuyShopNavActive,
  isRentShopNavActive,
  isShopBrowseNavPath,
} from "./shopNavMatch";

describe("isShopBrowseNavPath", () => {
  test("matches shop catalog only", () => {
    expect(isShopBrowseNavPath("/shop")).toBe(true);
    expect(isShopBrowseNavPath("/shop/cart")).toBe(false);
    expect(isShopBrowseNavPath("/shop/cart/checkout")).toBe(false);
    expect(isShopBrowseNavPath("/shop/product-details/abc")).toBe(false);
  });
});

describe("isRentShopNavActive", () => {
  test("does not highlight on cart", () => {
    expect(isRentShopNavActive("/shop/cart", "")).toBe(false);
    expect(isRentShopNavActive("/shop/cart/checkout", "")).toBe(false);
  });

  test("highlights on shop browse with default or rental filter", () => {
    expect(isRentShopNavActive("/shop", "")).toBe(true);
    expect(isRentShopNavActive("/shop", "RENTAL,RENT_OR_RESALE")).toBe(true);
    expect(isRentShopNavActive("/shop", "RESALE,RENT_OR_RESALE")).toBe(false);
  });
});

describe("isBuyShopNavActive", () => {
  test("does not highlight on cart", () => {
    expect(isBuyShopNavActive("/shop/cart", "RESALE,RENT_OR_RESALE")).toBe(
      false,
    );
  });

  test("highlights on shop browse with resale filter", () => {
    expect(isBuyShopNavActive("/shop", "RESALE,RENT_OR_RESALE")).toBe(true);
    expect(isBuyShopNavActive("/shop", "RENTAL,RENT_OR_RESALE")).toBe(false);
  });
});
