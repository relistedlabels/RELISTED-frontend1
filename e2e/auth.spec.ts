import { expect, test } from "@playwright/test";

test.describe("Authentication", () => {
  test("should display login page correctly", async ({ page }) => {
    await page.goto("/auth/sign-in");

    await expect(page.getByText("Welcome Back")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("should display create account page correctly", async ({ page }) => {
    await page.goto("/auth/create-account");

    await expect(page.getByText("Who are you joining as?")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("Renter").first()).toBeVisible();
    await expect(page.getByText("Lister").first()).toBeVisible();
  });

  test("should have role selection buttons on create account page", async ({
    page,
  }) => {
    await page.goto("/auth/create-account");

    await expect(
      page.getByRole("button", { name: /continue as a renter/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /continue as a lister/i }),
    ).toBeVisible();
  });

  test("should navigate to sign-up after selecting role", async ({ page }) => {
    await page.goto("/auth/create-account");

    await page.getByRole("button", { name: /continue as a renter/i }).click();

    await expect(page).toHaveURL(/create-account\/sign-up/);
  });
});
