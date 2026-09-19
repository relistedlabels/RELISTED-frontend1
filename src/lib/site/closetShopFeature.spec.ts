import { describe, expect, test } from "bun:test";
import {
  isClosetShopFeatureEnabled,
  stripClosetShopSearchParams,
} from "./closetShopFeature";

describe("isClosetShopFeatureEnabled", () => {
  test("is enabled by default when flag is missing", () => {
    expect(isClosetShopFeatureEnabled(undefined)).toBe(true);
  });

  test("is disabled when admin turns feature off", () => {
    expect(
      isClosetShopFeatureEnabled({ headerClosetsShopNavEnabled: false }),
    ).toBe(false);
  });
});

describe("stripClosetShopSearchParams", () => {
  test("removes closet drop params and title", () => {
    const params = new URLSearchParams(
      "onlyWithCloset=true&title=Vault+Closet+Drops&description=Limited",
    );
    expect(stripClosetShopSearchParams(params)).toBe(true);
    expect(params.get("onlyWithCloset")).toBeNull();
    expect(params.get("title")).toBeNull();
  });
});
