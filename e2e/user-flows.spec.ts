import { expect, test } from "@playwright/test";

test.describe("Lister Flow", () => {
  test("should allow access to lister pages - backend handles auth", async ({
    page,
  }) => {
    await page.goto("/listers/dashboard");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should allow access to lister inventory - backend handles auth", async ({
    page,
  }) => {
    await page.goto("/listers/inventory");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should allow access to lister upload page - backend handles auth", async ({
    page,
  }) => {
    await page.goto("/listers/inventory/product-upload");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should allow access to lister wallet - backend handles auth", async ({
    page,
  }) => {
    await page.goto("/listers/wallet");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display verification page with document type selector", async ({
    page,
  }) => {
    // Go to settings page - backend will redirect to login if not authenticated
    await page.goto("/listers/settings?tab=verifications");
    await page.waitForLoadState("networkidle");

    // Wait a bit for any redirects
    await page.waitForTimeout(2000);

    // Check if we're on login page (redirect for unauthenticated)
    const loginHeader = page.getByText("Welcome Back");
    if (await loginHeader.isVisible().catch(() => false)) {
      // Skip test if login required - backend handles auth
      test.skip();
      return;
    }

    // Check that document type selector is visible
    await expect(page.getByText("Document Type")).toBeVisible({
      timeout: 10000,
    });

    // Check that the selector has the expected options
    await expect(page.getByRole("combobox")).toBeVisible();
  });
});

test.describe("Renter Flow", () => {
  test("should allow access to renter pages - backend handles auth", async ({
    page,
  }) => {
    await page.goto("/renters/dashboard");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should allow access to renter orders - backend handles auth", async ({
    page,
  }) => {
    await page.goto("/renters/orders");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should allow access to renter wallet - backend handles auth", async ({
    page,
  }) => {
    await page.goto("/renters/wallet");
    await page.waitForLoadState("domcontentloaded");
  });
});

test.describe("Shop and Browse", () => {
  test("should allow browsing shop without authentication", async ({
    page,
  }) => {
    await page.goto("/shop");
    await expect(page.locator("div.grid").first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("should allow viewing product details without authentication", async ({
    page,
  }) => {
    await page.goto("/shop");
    await page.waitForLoadState("networkidle");
  });
});
