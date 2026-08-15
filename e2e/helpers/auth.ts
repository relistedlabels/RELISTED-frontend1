import type { Page } from "@playwright/test";

import { authFixtures } from "../fixtures/auth";

export function uniqueSignupEmail(role: "renter" | "lister"): string {
  const domain = authFixtures.signup.emailDomain;
  const safe = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `e2e.${role}.${safe}.${rand}@${domain}`;
}

export async function selectRoleAndOpenSignUp(
  page: Page,
  role: "renter" | "lister",
): Promise<void> {
  await page.goto("/auth/create-account");
  const pattern =
    role === "renter" ? /continue as a renter/i : /continue as a lister/i;
  await page.getByRole("button", { name: pattern }).click();
  await page.waitForURL(/\/auth\/create-account\/sign-up/);
}

export async function submitCreateAccountForm(
  page: Page,
  opts: { fullName: string; email: string; password: string },
): Promise<void> {
  await page.getByPlaceholder("Enter your full name").fill(opts.fullName);
  await page.getByPlaceholder("Enter your email").fill(opts.email);
  await page
    .getByPlaceholder("Enter your password")
    .first()
    .fill(opts.password);
  await page.getByPlaceholder("Re-enter your password").fill(opts.password);
  await page.locator('input[name="terms"]').check();
  await page.getByRole("button", { name: /^create account$/i }).click();
}

export async function submitSignInForm(
  page: Page,
  opts: { email: string; password: string },
): Promise<void> {
  await page.goto("/auth/sign-in");
  await page.getByPlaceholder("Enter your email").fill(opts.email);
  await page.getByPlaceholder("Enter your password").fill(opts.password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
}
