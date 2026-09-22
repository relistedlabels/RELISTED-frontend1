import { describe, expect, test } from "bun:test";
import {
  isValidPhoneNumber,
  normalizePhoneNumber,
  validatePhoneNumber,
} from "./phone";

describe("normalizePhoneNumber", () => {
  test("normalizes Nigerian numbers with country code", () => {
    expect(normalizePhoneNumber("+2348012345678")).toBe("+2348012345678");
  });

  test("normalizes Nigerian numbers with leading zero", () => {
    expect(normalizePhoneNumber("08012345678")).toBe("+2348012345678");
  });

  test("rejects incomplete Nigerian numbers", () => {
    expect(normalizePhoneNumber("+23480123")).toBeNull();
    expect(normalizePhoneNumber("+234")).toBeNull();
  });

  test("rejects country code only", () => {
    expect(normalizePhoneNumber("+234")).toBeNull();
  });

  test("rejects non-Nigerian numbers", () => {
    expect(normalizePhoneNumber("+233201234567")).toBeNull();
    expect(normalizePhoneNumber("+254712345678")).toBeNull();
  });
});

describe("validatePhoneNumber", () => {
  test("requires a value by default", () => {
    expect(validatePhoneNumber("")).toBe("Enter a phone number.");
  });

  test("accepts optional empty values", () => {
    expect(validatePhoneNumber("", { optional: true })).toBeNull();
  });

  test("rejects invalid numbers", () => {
    expect(validatePhoneNumber("+234801")).toBe(
      "Enter a valid Nigerian phone number.",
    );
  });
});

describe("isValidPhoneNumber", () => {
  test("accepts complete numbers", () => {
    expect(isValidPhoneNumber("08080808080")).toBe(true);
  });

  test("rejects incomplete numbers", () => {
    expect(isValidPhoneNumber("+234808")).toBe(false);
  });
});
