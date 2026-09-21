import { describe, expect, test } from "bun:test";
import {
  formatPhoneDisplayLine,
  profileHasPhone,
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
});

describe("formatPhoneDisplayLine", () => {
  test("returns resolved phone for display", () => {
    expect(formatPhoneDisplayLine({ phone: "+2348012345678" })).toBe(
      "+2348012345678",
    );
  });
});
