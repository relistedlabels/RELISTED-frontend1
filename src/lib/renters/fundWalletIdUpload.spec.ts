import { describe, expect, test } from "bun:test";
import {
  isFundWalletIdNumberComplete,
  sanitizeFundWalletIdInput,
  validateFundWalletIdNumber,
} from "./fundWalletIdUpload";

describe("fundWalletIdUpload", () => {
  test("sanitizes NIN to digits only", () => {
    expect(sanitizeFundWalletIdInput("NIN", "12a34 5678901")).toBe("12345678901");
  });

  test("sanitizes passport to uppercase alphanumeric", () => {
    expect(sanitizeFundWalletIdInput("PASSPORT", "a1-b2c3d4")).toBe("A1B2C3D4");
  });

  test("validates complete ID numbers by document type", () => {
    expect(isFundWalletIdNumberComplete("NIN", "12345678901")).toBe(true);
    expect(isFundWalletIdNumberComplete("NIN", "1234567890")).toBe(false);

    expect(isFundWalletIdNumberComplete("PASSPORT", "A1234567")).toBe(true);
    expect(isFundWalletIdNumberComplete("PASSPORT", "A123456")).toBe(false);

    expect(isFundWalletIdNumberComplete("DRIVERS_LICENSE", "LAG1234567G1")).toBe(
      true,
    );
    expect(isFundWalletIdNumberComplete("DRIVERS_LICENSE", "LAG123")).toBe(
      false,
    );
  });

  test("returns short validation messages", () => {
    expect(validateFundWalletIdNumber("NIN", "123")).toBe("Enter a valid NIN.");
    expect(validateFundWalletIdNumber("PASSPORT", "ABC")).toBe(
      "Enter a valid passport number.",
    );
    expect(validateFundWalletIdNumber("DRIVERS_LICENSE", "ABC")).toBe(
      "Enter a valid licence number.",
    );
  });
});
