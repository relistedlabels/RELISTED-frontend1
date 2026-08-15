import { describe, expect, test } from "bun:test";
import {
  getRenterOrderBadgeClassName,
  getRenterOrderBadgeTone,
  getRenterOrderStatusLabel,
  normalizeRenterOrderStatusKey,
} from "./renterOrderStatus";

describe("normalizeRenterOrderStatusKey", () => {
  test("uppercases and normalizes hyphens", () => {
    expect(normalizeRenterOrderStatusKey(" in-transit ")).toBe("IN_TRANSIT");
  });
});

describe("getRenterOrderStatusLabel", () => {
  test("maps known statuses", () => {
    expect(getRenterOrderStatusLabel("PROCESSING")).toBe("Processing");
    expect(getRenterOrderStatusLabel("IN_TRANSIT")).toBe("In transit");
    expect(getRenterOrderStatusLabel("RETURN_DUE")).toBe("Return Due");
    expect(getRenterOrderStatusLabel("IN_DISPUTE")).toBe("In Dispute");
  });

  test("title-cases unknown statuses with underscores", () => {
    expect(getRenterOrderStatusLabel("custom_status")).toBe("Custom Status");
  });

  test("returns Unknown for empty input", () => {
    expect(getRenterOrderStatusLabel("")).toBe("Unknown");
  });
});

describe("getRenterOrderBadgeTone", () => {
  test("maps danger and warning labels", () => {
    expect(getRenterOrderBadgeTone("Cancelled")).toBe("danger");
    expect(getRenterOrderBadgeTone("Rejected")).toBe("danger");
    expect(getRenterOrderBadgeTone("Return Due")).toBe("warning");
    expect(getRenterOrderBadgeTone("In Dispute")).toBe("warning");
  });

  test("maps active pipeline labels to success", () => {
    expect(getRenterOrderBadgeTone("Processing")).toBe("success");
    expect(getRenterOrderBadgeTone("In transit")).toBe("success");
    expect(getRenterOrderBadgeTone("Completed")).toBe("success");
  });

  test("falls back to neutral", () => {
    expect(getRenterOrderBadgeTone("Accepted")).toBe("neutral");
  });
});

describe("getRenterOrderBadgeClassName", () => {
  test("returns tone-specific classes", () => {
    expect(getRenterOrderBadgeClassName("Cancelled")).toContain("bg-red-100");
    expect(getRenterOrderBadgeClassName("Return Due")).toContain("bg-[#FFF9E5]");
  });
});
