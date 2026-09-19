import { describe, expect, test } from "bun:test";
import { shopCategoryHref, shopTagHref } from "./productDetailLinks";

describe("productDetailLinks", () => {
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
