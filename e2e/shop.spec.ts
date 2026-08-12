import { expect, test } from "./fixtures/test";

test.describe("Shop Page", () => {
  test("@smoke should display shop page with products", async ({ page }) => {
    await page.goto("/shop", { waitUntil: "domcontentloaded" });

    await expect(page.locator("div.grid").first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("@smoke stale token in localStorage should not redirect away from shop", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "user-store",
        JSON.stringify({
          state: {
            token: "stale-invalid-jwt-for-e2e",
            userId: "00000000-0000-0000-0000-000000000099",
            name: "E2E Stale",
            email: "stale@e2e.test",
            role: "RENTER",
            sessionToken: null,
            requiresMfa: false,
          },
          version: 0,
        }),
      );
    });

    await page.goto("/shop", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/shop/, { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/auth\/(sign-in|create-account)/);
    await expect(page.locator("div.grid").first()).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe("Product Details", () => {
  test("should handle product details page without ID gracefully", async ({
    page,
  }) => {
    await page.goto("/shop/product-details", { waitUntil: "domcontentloaded" });
  });
});
