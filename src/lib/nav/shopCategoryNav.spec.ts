import { describe, expect, test } from "bun:test";
import { shopCategoryNavItems } from "./shopCategoryNav";

describe("shopCategoryNavItems", () => {
  test("returns all categories in stable alphabetical order", () => {
    const items = shopCategoryNavItems([
      { id: "2", name: "Tops" },
      { id: "1", name: "Dresses" },
      { id: "3", name: "Bottoms" },
    ]);

    expect(items.map((item) => item.name)).toEqual([
      "Bottoms",
      "Dresses",
      "Tops",
    ]);
    expect(items[1]?.filter).toEqual({ key: "category", value: "1" });
  });
});
