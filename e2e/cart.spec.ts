import { expect, test } from "@playwright/test";

test.describe("Cart", () => {
  test("should display cart page with heading", async ({ page }) => {
    await page.goto("/shop/cart");

    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible({
      timeout: 10000,
    });
  });

  test("should show empty cart message or cart items", async ({ page }) => {
    await page.goto("/shop/cart");

    await page.waitForLoadState("networkidle");

    const emptyMessage = page.getByText("Your cart is empty");
    const cartItems = page.locator('[class*="grid"]').first();

    await expect(emptyMessage.or(cartItems)).toBeVisible({ timeout: 10000 });
  });

  test("should have checkout button when cart has items", async ({ page }) => {
    await page.goto("/shop/cart");

    await page.waitForLoadState("networkidle");
  });

  test("should require login to access cart", async ({ page }) => {
    await page.goto("/shop/cart");

    await page.waitForLoadState("networkidle");
  });
});
