import { describe, expect, test } from "bun:test";
import { pickVaultHomeStripProducts } from "./pickVaultHomeStripProducts";
import type { UserProduct } from "@/lib/api/product";

function product(id: string, closetId?: string): UserProduct {
  return {
    id,
    closetId,
    closet: closetId ? { id: closetId, name: `Closet ${closetId}` } : undefined,
  } as UserProduct;
}

describe("pickVaultHomeStripProducts", () => {
  test("returns empty for non-positive limit or empty input", () => {
    expect(pickVaultHomeStripProducts([], 5)).toEqual([]);
    expect(pickVaultHomeStripProducts([product("a", "c1")], 0)).toEqual([]);
  });

  test("round-robins across closets so one wardrobe does not dominate", () => {
    const originalRandom = Math.random;
    Math.random = () => 0;

    try {
      const products = [
        product("a1", "closet-a"),
        product("a2", "closet-a"),
        product("b1", "closet-b"),
        product("b2", "closet-b"),
        product("c1", "closet-c"),
      ];

      const picked = pickVaultHomeStripProducts(products, 3);
      const closetIds = picked.map((p) => p.closet?.id ?? p.closetId);

      expect(picked).toHaveLength(3);
      expect(new Set(closetIds).size).toBe(3);
    } finally {
      Math.random = originalRandom;
    }
  });

  test("includes products without closet after bucket round-robin", () => {
    const originalRandom = Math.random;
    Math.random = () => 0;

    try {
      const products = [
        product("a1", "closet-a"),
        product("orphan-1"),
        product("orphan-2"),
      ];

      const picked = pickVaultHomeStripProducts(products, 3);
      expect(picked).toHaveLength(3);
      expect(picked[0]?.id).toBe("a1");
      expect(picked.slice(1).map((p) => p.id).sort()).toEqual([
        "orphan-1",
        "orphan-2",
      ]);
    } finally {
      Math.random = originalRandom;
    }
  });

  test("falls back to slice when no closet ids are present", () => {
    const products = [product("x"), product("y"), product("z")];
    expect(pickVaultHomeStripProducts(products, 2).map((p) => p.id)).toEqual([
      "x",
      "y",
    ]);
  });
});
