import { describe, expect, test } from "bun:test";
import { amountAfterPlatformFee, computePlatformFee } from "./platformFee";

describe("platformFee", () => {
  test("computes whole-naira fee and net", () => {
    expect(computePlatformFee(50000, 10)).toBe(5000);
    expect(amountAfterPlatformFee(50000, 10)).toBe(45000);
    expect(computePlatformFee(1005, 10)).toBe(101);
  });

  test("handles empty and zero rate", () => {
    expect(computePlatformFee(0, 10)).toBe(0);
    expect(amountAfterPlatformFee(NaN, 10)).toBe(0);
    expect(amountAfterPlatformFee(10000, 0)).toBe(10000);
  });
});
