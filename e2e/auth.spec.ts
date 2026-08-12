import { expect, test } from "./fixtures/test";

test.describe("Authentication", () => {
  test("@smoke should display login page correctly", async ({ page }) => {
    await page.goto("/auth/sign-in", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("Welcome Back")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("@smoke should display create account page correctly", async ({
    page,
  }) => {
    await page.goto("/auth/create-account", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("Who are you joining as?")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Renter").first()).toBeVisible();
    await expect(page.getByText("Lister").first()).toBeVisible();
  });

  test("should navigate to sign-up after selecting role", async ({ page }) => {
    await page.goto("/auth/create-account", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: /continue as a renter/i }).click();

    await expect(page).toHaveURL(/create-account\/sign-up/);
  });
});
