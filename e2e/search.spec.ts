import { expect, test } from "@playwright/test";

test.describe("Search", () => {
  test("should display shop page where search is available", async ({
    page,
  }) => {
    await page.goto("/shop");

    await page.waitForLoadState("networkidle");

    // Shop page should load - verify products grid is visible
    await expect(page.locator("div.grid").first()).toBeVisible({
      timeout: 15000,
    });
  });
});
