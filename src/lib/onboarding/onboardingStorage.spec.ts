import { describe, expect, test } from "bun:test";
import {
  shopPathForPreference,
  type RenterShopPreference,
} from "./onboardingStorage";

describe("shopPathForPreference", () => {
  test("maps renter shop preferences to shop URLs", () => {
    expect(shopPathForPreference("rent")).toBe("/shop?availability=Rent");
    expect(shopPathForPreference("resale")).toBe("/shop?availability=Resale");
    expect(shopPathForPreference("all")).toBe("/shop");
  });

  test("accepts all preference values", () => {
    const prefs: RenterShopPreference[] = ["rent", "resale", "all"];
    for (const pref of prefs) {
      expect(shopPathForPreference(pref)).toMatch(/^\/shop/);
    }
  });
});
