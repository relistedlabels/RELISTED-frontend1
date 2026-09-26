import { describe, expect, test } from "bun:test";
import { buildSimilarShopHref } from "./buildSimilarShopHref";

describe("buildSimilarShopHref", () => {
  test("builds a shop URL with matching filters only", () => {
    const href = buildSimilarShopHref({
      categoryId: "cat-dresses",
      brandName: "Zara",
      color: "Black",
      size: "M",
      primaryTag: "Evening",
    });

    expect(href).toBe(
      "/shop?listingType=RENTAL%2CRENT_OR_RESALE&category=cat-dresses&brand=Zara&color=Black&size=M&tags=Evening",
    );
    expect(href).not.toContain("title=");
    expect(href).not.toContain("description=");
  });

  test("uses buy listing types for purchase checks", () => {
    const href = buildSimilarShopHref({
      isPurchase: true,
      brandName: "Gucci",
    });

    expect(href).toBe(
      "/shop?listingType=RESALE%2CRENT_OR_RESALE&brand=Gucci",
    );
  });

  test("falls back to listing type only when no product context exists", () => {
    expect(buildSimilarShopHref()).toBe(
      "/shop?listingType=RENTAL%2CRENT_OR_RESALE",
    );
  });
});
