import { describe, expect, test } from "bun:test";
import { buildClosetListParams } from "./closets";

describe("buildClosetListParams", () => {
  test("builds paginated admin closet list query string", () => {
    expect(buildClosetListParams({ page: 2, limit: 20 })).toBe(
      "?page=2&limit=20",
    );
  });

  test("trims search and omits empty query", () => {
    expect(buildClosetListParams({ search: "  vault  " })).toBe(
      "?search=vault",
    );
    expect(buildClosetListParams({})).toBe("");
  });
});
