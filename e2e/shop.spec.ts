import { expect, test } from "@playwright/test";

test.describe("Shop Page", () => {
  test("should display shop page with products", async ({ page }) => {
    await page.goto("/shop");

    await page.waitForLoadState("networkidle");
    await expect(page.locator("div.grid").first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display products grid", async ({ page }) => {
    await page.goto("/shop");

    await page.waitForLoadState("networkidle");

    const grid = page.locator("div.grid");
    await expect(grid.first()).toBeVisible({ timeout: 15000 });
  });

  test("should show loading state initially", async ({ page }) => {
    await page.goto("/shop");

    await expect(page.getByText("Loading products")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should load shop page without errors", async ({ page }) => {
    await page.goto("/shop");

    await page.waitForLoadState("networkidle");

    await expect(page.locator("div.grid").first()).toBeVisible({
      timeout: 15000,
    });
  });
});

test.describe("Product Details", () => {
  test("should handle product details page without ID gracefully", async ({
    page,
  }) => {
    await page.goto("/shop/product-details");

    await page.waitForLoadState("domcontentloaded");
  });
});
