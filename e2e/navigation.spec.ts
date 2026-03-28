import { expect, test } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display home page correctly", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/RELISTED/);
  });

  test("should have navigation to shop", async ({ page }) => {
    await page.goto("/");

    const shopLink = page.getByRole("link", { name: /shop/i });
    await expect(shopLink.first()).toBeVisible();
  });

  test("should have navbar with logo", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('img[src*="logo"]').first()).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("Navigation", () => {
  test("should navigate from home to shop", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /shop/i }).first().click();

    await expect(page).toHaveURL(/shop/);
  });

  test("should navigate from home to about page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "About", exact: true }).click();

    await expect(page).toHaveURL(/about/);
  });

  test("should navigate from home to contact page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /contact/i }).click();

    await expect(page).toHaveURL(/contact/);
  });
});
