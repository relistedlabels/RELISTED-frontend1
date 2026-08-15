import { expect, test } from "./fixtures/test";

test.describe("Home Page", () => {
  test("@smoke should display home page correctly", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/RELISTED/);
  });

  test("@smoke should have navigation to shop", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const shopLink = page.getByRole("link", { name: /shop/i });
    await expect(shopLink.first()).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("@smoke should navigate from home to shop", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /shop/i }).first().click();
    await expect(page).toHaveURL(/shop/);
  });

  test("should navigate from home to about page", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: "About", exact: true }).click();
    await expect(page).toHaveURL(/about/);
  });

  test("should navigate from home to contact page", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /contact/i }).click();
    await expect(page).toHaveURL(/contact/);
  });
});
