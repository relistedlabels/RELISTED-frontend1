import { describe, expect, test } from "bun:test";
import { parseCheckoutStep } from "./parseCheckoutStep";

describe("parseCheckoutStep", () => {
  test("maps pay step from query param", () => {
    expect(parseCheckoutStep(null)).toBe(1);
    expect(parseCheckoutStep("1")).toBe(1);
    expect(parseCheckoutStep("2")).toBe(2);
  });

  test("maps legacy confirm URLs to pay", () => {
    expect(parseCheckoutStep("3")).toBe(2);
    expect(parseCheckoutStep("4")).toBe(2);
  });
});
