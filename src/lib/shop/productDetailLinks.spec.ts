import { describe, expect, test } from "bun:test";
import {
  productDetailHref,
  resolveProductDetailTab,
  shopCategoryHref,
  shopTagHref,
} from "./productDetailLinks";

describe("productDetailLinks", () => {
  test("builds product detail link without mode", () => {
    expect(productDetailHref("abc-123")).toBe("/shop/product-details/abc-123");
  });

  test("builds product detail link with buy mode", () => {
    expect(productDetailHref("abc-123", "buy")).toBe(
      "/shop/product-details/abc-123?mode=buy",
    );
  });

  test("defaults dual listing tab to rent", () => {
    expect(resolveProductDetailTab(null, true, true)).toBe("rent");
  });

  test("defaults dual listing tab to buy when mode is buy", () => {
    expect(resolveProductDetailTab("buy", true, true)).toBe("resale");
  });

  test("falls back to rent when buy mode but listing is rent-only", () => {
    expect(resolveProductDetailTab("buy", true, false)).toBe("rent");
  });

  test("builds category shop link", () => {
    expect(shopCategoryHref({ id: "cat-1", name: "Dresses" })).toBe(
      "/shop?category=cat-1&title=Dresses&description=Shop+Dresses",
    );
  });

  test("builds tag shop link", () => {
    expect(shopTagHref("Night Out")).toBe(
      "/shop?tags=Night+Out&title=Night+Out&description=Shop+Night+Out",
    );
  });
});
