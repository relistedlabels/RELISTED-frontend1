import { describe, expect, test } from "bun:test";
import {
  formatPhoneDisplayLine,
  profileHasPhone,
  profilePhoneNeedsUpdate,
  resolveProfilePhone,
} from "./profilePhone";

describe("resolveProfilePhone", () => {
  test("prefers profile phoneNumber then phone", () => {
    expect(
      resolveProfilePhone(
        { phoneNumber: "", phone: "+2348012345678" },
        { phone: "+2348098765432" },
      ),
    ).toBe("+2348012345678");
  });

  test("falls back to emergency contact phone", () => {
    expect(
      resolveProfilePhone({
        phoneNumber: "",
        emergencyContact: { phoneNumber: "08012345678" },
      }),
    ).toBe("08012345678");
  });
});

describe("profileHasPhone", () => {
  test("accepts renter profile phone field", () => {
    expect(profileHasPhone({ phone: "+2348012345678" })).toBe(true);
  });

  test("rejects missing phone", () => {
    expect(profileHasPhone({ phoneNumber: "" })).toBe(false);
  });

  test("rejects incomplete phone numbers", () => {
    expect(profileHasPhone({ phone: "+234801" })).toBe(false);
    expect(profileHasPhone({ phone: "+234" })).toBe(false);
  });
});

describe("profilePhoneNeedsUpdate", () => {
  test("flags saved numbers that fail validation", () => {
    expect(profilePhoneNeedsUpdate({ phone: "+234802424242444" })).toBe(true);
    expect(profilePhoneNeedsUpdate({ phone: "+234801" })).toBe(true);
  });

  test("returns false when phone is missing or already valid", () => {
    expect(profilePhoneNeedsUpdate({ phoneNumber: "" })).toBe(false);
    expect(profilePhoneNeedsUpdate({ phone: "+2348012345678" })).toBe(false);
  });
});

describe("formatPhoneDisplayLine", () => {
  test("returns resolved phone for display", () => {
    expect(formatPhoneDisplayLine({ phone: "+2348012345678" })).toBe(
      "+2348012345678",
    );
  });
});
