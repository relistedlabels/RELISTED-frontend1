import { afterAll, describe, expect, test } from "bun:test";
import { INHOUSE_USER_ID } from "@/lib/inhouseManager";
import {
  isClosetInventoryOpenForAllListersFlag,
  isClosetInventoryLister,
  parseClosetInventoryAllowlist,
} from "./closetInventoryAccess";

const prevAll = process.env.NEXT_PUBLIC_CLOSET_INVENTORY_ALL_LISTERS;
const prevIds = process.env.NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS;

afterAll(() => {
  if (prevAll === undefined) delete process.env.NEXT_PUBLIC_CLOSET_INVENTORY_ALL_LISTERS;
  else process.env.NEXT_PUBLIC_CLOSET_INVENTORY_ALL_LISTERS = prevAll;
  if (prevIds === undefined) delete process.env.NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS;
  else process.env.NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS = prevIds;
});

describe("parseClosetInventoryAllowlist", () => {
  test("defaults to the inhouse manager id when env is unset or blank", () => {
    expect(parseClosetInventoryAllowlist(undefined, INHOUSE_USER_ID)).toEqual([
      INHOUSE_USER_ID,
    ]);
    expect(parseClosetInventoryAllowlist("   ", INHOUSE_USER_ID)).toEqual([
      INHOUSE_USER_ID,
    ]);
  });

  test("parses comma-separated allowlist from env", () => {
    expect(
      parseClosetInventoryAllowlist(
        " uuid-a , uuid-b ,uuid-c ",
        INHOUSE_USER_ID,
      ),
    ).toEqual(["uuid-a", "uuid-b", "uuid-c"]);
  });
});

describe("isClosetInventoryOpenForAllListersFlag", () => {
  test("recognizes true and 1", () => {
    expect(isClosetInventoryOpenForAllListersFlag("true")).toBe(true);
    expect(isClosetInventoryOpenForAllListersFlag("TRUE")).toBe(true);
    expect(isClosetInventoryOpenForAllListersFlag("1")).toBe(true);
  });

  test("treats false, empty, and undefined as closed", () => {
    expect(isClosetInventoryOpenForAllListersFlag("false")).toBe(false);
    expect(isClosetInventoryOpenForAllListersFlag("")).toBe(false);
    expect(isClosetInventoryOpenForAllListersFlag(undefined)).toBe(false);
  });
});

describe("isClosetInventoryLister", () => {
  const prevAll = process.env.NEXT_PUBLIC_CLOSET_INVENTORY_ALL_LISTERS;
  const prevIds = process.env.NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS;

  test("allows only the default inhouse id when env overrides are absent", () => {
    delete process.env.NEXT_PUBLIC_CLOSET_INVENTORY_ALL_LISTERS;
    delete process.env.NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS;

    expect(isClosetInventoryLister(INHOUSE_USER_ID)).toBe(true);
    expect(isClosetInventoryLister("other-user-id")).toBe(false);
    expect(isClosetInventoryLister(undefined)).toBe(false);
  });

  test("honours NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS override", () => {
    delete process.env.NEXT_PUBLIC_CLOSET_INVENTORY_ALL_LISTERS;
    process.env.NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS =
      "partner-a, partner-b";

    expect(isClosetInventoryLister("partner-a")).toBe(true);
    expect(isClosetInventoryLister(INHOUSE_USER_ID)).toBe(false);
  });

  test("NEXT_PUBLIC_CLOSET_INVENTORY_ALL_LISTERS opens closet inventory to any lister", () => {
    process.env.NEXT_PUBLIC_CLOSET_INVENTORY_ALL_LISTERS = "true";
    process.env.NEXT_PUBLIC_CLOSET_INVENTORY_USER_IDS = "partner-a";

    expect(isClosetInventoryLister("any-lister")).toBe(true);
  });
});
