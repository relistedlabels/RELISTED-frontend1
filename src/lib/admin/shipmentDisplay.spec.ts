import { describe, expect, test } from "bun:test";
import { formatAdminPricingTier } from "./shipmentDisplay";

describe("formatAdminPricingTier", () => {
  test("returns em dash for empty, null, or whitespace-only tier", () => {
    expect(formatAdminPricingTier(null)).toBe("—");
    expect(formatAdminPricingTier(undefined)).toBe("—");
    expect(formatAdminPricingTier("")).toBe("—");
    expect(formatAdminPricingTier("   ")).toBe("—");
  });

  test("returns tier unchanged when no colon prefix", () => {
    expect(formatAdminPricingTier("chowdeck")).toBe("chowdeck");
    expect(formatAdminPricingTier("Relisted dispatch")).toBe("Relisted dispatch");
  });

  test("strips shipbubble-style prefix after first colon", () => {
    expect(formatAdminPricingTier("shipbubble:glovo_express")).toBe("glovo_express");
    expect(formatAdminPricingTier("shipbubble:chowdeck")).toBe("chowdeck");
  });

  test("only splits on the first colon", () => {
    expect(formatAdminPricingTier("shipbubble:foo:bar")).toBe("foo:bar");
  });
});
