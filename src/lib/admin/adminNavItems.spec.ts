import { describe, expect, test } from "bun:test";
import {
  getAdminNavItemDefinitions,
  getAdminNavItemIds,
} from "./adminNavItems";

describe("admin nav closets restore", () => {
  test("includes a Closets item linking to the closets admin route", () => {
    const closets = getAdminNavItemDefinitions().find((item) => item.id === "closets");
    expect(closets).toBeDefined();
    expect(closets?.label).toBe("Closets");
    expect(closets?.getHref("admin-abc")).toBe("/admin/admin-abc/closets");
  });

  test("keeps Campaigns as a separate nav item (not replaced by Closets)", () => {
    const ids = getAdminNavItemIds();
    expect(ids).toContain("closets");
    expect(ids).toContain("sales");
    expect(getAdminNavItemDefinitions().find((item) => item.id === "sales")?.label).toBe(
      "Campaigns",
    );
  });

  test("places Closets after Shipments and before Campaigns", () => {
    const ids = getAdminNavItemIds();
    const shipmentsIdx = ids.indexOf("shipments");
    const closetsIdx = ids.indexOf("closets");
    const salesIdx = ids.indexOf("sales");
    expect(shipmentsIdx).toBeGreaterThanOrEqual(0);
    expect(closetsIdx).toBeGreaterThan(shipmentsIdx);
    expect(salesIdx).toBeGreaterThan(closetsIdx);
  });
});
