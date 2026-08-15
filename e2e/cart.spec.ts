import { expect, test } from "./fixtures/test";

test.describe("Cart", () => {
  test("@smoke should display cart page with heading", async ({ page }) => {
    await page.goto("/shop/cart", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("should show empty cart message or cart items", async ({ page }) => {
    await page.goto("/shop/cart", { waitUntil: "domcontentloaded" });

    const emptyMessage = page.getByText("Your cart is empty");
    const cartItems = page.locator('[class*="grid"]').first();

    await expect(emptyMessage.or(cartItems)).toBeVisible({ timeout: 10_000 });
  });
});
