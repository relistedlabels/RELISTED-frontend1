import { afterAll, describe, expect, test } from "bun:test";
import {
  isClosetInventoryLister,
  parseClosetInventoryAllowlist,
} from "./closetInventoryAccess";

const prevIds = process.env.NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS;

afterAll(() => {
  if (prevIds === undefined)
    delete process.env.NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS;
  else process.env.NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS = prevIds;
});

describe("parseClosetInventoryAllowlist", () => {
  test("returns empty array when env is unset or blank", () => {
    expect(parseClosetInventoryAllowlist(undefined, "")).toEqual([]);
    expect(parseClosetInventoryAllowlist("   ", "")).toEqual([]);
  });

  test("parses comma-separated allowlist from env", () => {
    expect(
      parseClosetInventoryAllowlist(" uuid-a , uuid-b ,uuid-c ", ""),
    ).toEqual(["uuid-a", "uuid-b", "uuid-c"]);
  });
});

describe("isClosetInventoryLister", () => {
  test("returns false for all users when env override is absent", () => {
    delete process.env.NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS;

    expect(isClosetInventoryLister("any-user")).toBe(false);
    expect(isClosetInventoryLister(undefined)).toBe(false);
  });

  test("honours NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS override", () => {
    process.env.NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS = "partner-a, partner-b";

    expect(isClosetInventoryLister("partner-a")).toBe(true);
    expect(isClosetInventoryLister("partner-b")).toBe(true);
    expect(isClosetInventoryLister("other-user")).toBe(false);
  });
});
