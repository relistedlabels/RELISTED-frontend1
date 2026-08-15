import { expect, test } from "@playwright/test";
import { authFixtures } from "./fixtures/auth";
import {
  selectRoleAndOpenSignUp,
  submitCreateAccountForm,
  submitSignInForm,
  uniqueSignupEmail,
} from "./helpers/auth";

test.describe("Registration @slow", () => {
  test("renter: role → sign-up form → API success → verify-email", async ({
    page,
  }) => {
    const email = uniqueSignupEmail("renter");

    const signupResponse = page.waitForResponse(
      (res) =>
        res.request().method() === "POST" &&
        /\/auth\/signup\/?($|\?)/.test(new URL(res.url()).pathname),
      { timeout: 45_000 },
    );

    await selectRoleAndOpenSignUp(page, "renter");
    await expect(page.getByText("Create an account")).toBeVisible();

    await submitCreateAccountForm(page, {
      fullName: "E2E Renter",
      email,
      password: authFixtures.signup.newAccountPassword,
    });

    const res = await signupResponse;
    expect(
      res.ok(),
      `signup failed: ${res.status()} ${await res.text().catch(() => "")}`,
    ).toBeTruthy();

    await expect(page).toHaveURL(/\/auth\/verify-email/, { timeout: 15_000 });
    await expect(page.getByText(/check your email/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("lister: role → sign-up form → API success → verify-email", async ({
    page,
  }) => {
    const email = uniqueSignupEmail("lister");

    const signupResponse = page.waitForResponse(
      (res) =>
        res.request().method() === "POST" &&
        /\/auth\/signup\/?($|\?)/.test(new URL(res.url()).pathname),
      { timeout: 45_000 },
    );

    await selectRoleAndOpenSignUp(page, "lister");
    await expect(page.getByText("Create an account")).toBeVisible();

    await submitCreateAccountForm(page, {
      fullName: "E2E Lister",
      email,
      password: authFixtures.signup.newAccountPassword,
    });

    const res = await signupResponse;
    expect(
      res.ok(),
      `signup failed: ${res.status()} ${await res.text().catch(() => "")}`,
    ).toBeTruthy();

    await expect(page).toHaveURL(/\/auth\/verify-email/, { timeout: 15_000 });
    await expect(page.getByText(/check your email/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe("Sign in (seeded accounts) @slow", () => {
  test("renter reaches home after login", async ({ page }) => {
    const { email, password } = authFixtures.seededRenter;

    await submitSignInForm(page, { email, password });

    await page.waitForURL(
      (url) => url.pathname === "/" || url.pathname === "",
      { timeout: 30_000 },
    );
  });

  test("lister reaches lister dashboard after login", async ({ page }) => {
    const { email, password } = authFixtures.seededLister;

    await submitSignInForm(page, { email, password });

    await page.waitForURL(
      (url) => url.pathname.startsWith("/listers/dashboard"),
      {
        timeout: 30_000,
      },
    );
  });
});
