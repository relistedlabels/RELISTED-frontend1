import { describe, expect, test } from "bun:test";
import {
  getOnboardingPathForAuthRole,
  isCheckoutRedirect,
  resolvePostAuthDestination,
  shouldBypassOnboardingForPath,
  shouldRedirectToOnboarding,
  shouldShowOnboardingPromptForUser,
} from "./onboardingGate";

describe("shouldBypassOnboardingForPath", () => {
  test("bypasses auth, onboarding, admin, and checkout paths", () => {
    expect(shouldBypassOnboardingForPath("/auth/sign-in")).toBe(true);
    expect(shouldBypassOnboardingForPath("/onboarding/renter")).toBe(true);
    expect(shouldBypassOnboardingForPath("/admin/k340eol21/orders")).toBe(true);
    expect(shouldBypassOnboardingForPath("/shop/cart/checkout")).toBe(true);
  });

  test("bypasses lister and renter task routes during an active onboarding task", () => {
    expect(
      shouldBypassOnboardingForPath("/listers/settings", { hasActiveTask: true }),
    ).toBe(true);
    expect(
      shouldBypassOnboardingForPath("/listers/inventory/product-upload", {
        hasActiveTask: true,
      }),
    ).toBe(true);
    expect(
      shouldBypassOnboardingForPath("/listers/wallet", { hasActiveTask: true }),
    ).toBe(true);
    expect(
      shouldBypassOnboardingForPath("/renters/account", { hasActiveTask: true }),
    ).toBe(true);
    expect(
      shouldBypassOnboardingForPath("/renters/wallet", { hasActiveTask: true }),
    ).toBe(true);
  });

  test("does not bypass normal app routes", () => {
    expect(shouldBypassOnboardingForPath("/shop")).toBe(false);
    expect(shouldBypassOnboardingForPath("/listers/dashboard")).toBe(false);
    expect(shouldBypassOnboardingForPath("/")).toBe(false);
  });
});

describe("resolvePostAuthDestination", () => {
  test("sends incomplete renters to shop (browse-first)", () => {
    expect(
      resolvePostAuthDestination({
        role: "RENTER",
        userId: "user-1",
      }),
    ).toBe("/shop");
  });

  test("honors checkout redirect before default destination", () => {
    expect(
      resolvePostAuthDestination({
        role: "RENTER",
        userId: "user-1",
        redirectUrl: "/shop/cart/checkout?step=2",
      }),
    ).toBe("/shop/cart/checkout?step=2");
  });

  test("honors post-login redirect for listers when incomplete", () => {
    expect(
      resolvePostAuthDestination({
        role: "LISTER",
        userId: "user-2",
        redirectUrl: "/listers/inventory",
        honorRedirect: true,
      }),
    ).toBe("/listers/inventory");
  });

  test("defaults listers to dashboard", () => {
    expect(
      resolvePostAuthDestination({
        role: "LISTER",
        userId: "user-2",
      }),
    ).toBe("/listers/dashboard");
  });
});

describe("shouldRedirectToOnboarding", () => {
  test("never forces redirect (browse-first)", () => {
    expect(
      shouldRedirectToOnboarding({
        pathname: "/shop",
        role: "RENTER",
        userId: "user-redirect-1",
        isAuthenticated: true,
      }),
    ).toBeNull();
  });

  test("does not redirect logged out users", () => {
    expect(
      shouldRedirectToOnboarding({
        pathname: "/shop",
        role: "RENTER",
        userId: null,
        isAuthenticated: false,
      }),
    ).toBeNull();
  });
});

describe("shouldShowOnboardingPromptForUser", () => {
  test("offers prompt for new renters", () => {
    expect(
      shouldShowOnboardingPromptForUser({
        role: "RENTER",
        userId: "prompt-user-1",
        isAuthenticated: true,
      }),
    ).toBe(true);
  });

  test("skips admins", () => {
    expect(
      shouldShowOnboardingPromptForUser({
        role: "ADMIN",
        userId: "admin-1",
        isAuthenticated: true,
      }),
    ).toBe(false);
  });
});

describe("getOnboardingPathForAuthRole", () => {
  test("maps roles to onboarding routes", () => {
    expect(getOnboardingPathForAuthRole("RENTER")).toBe("/onboarding/renter");
    expect(getOnboardingPathForAuthRole("LISTER")).toBe("/onboarding/lister");
    expect(getOnboardingPathForAuthRole("ADMIN")).toBeNull();
  });
});

describe("isCheckoutRedirect", () => {
  test("detects checkout URLs", () => {
    expect(isCheckoutRedirect("/shop/cart/checkout")).toBe(true);
    expect(isCheckoutRedirect("/shop/cart/checkout/success")).toBe(true);
    expect(isCheckoutRedirect("/shop/cart")).toBe(false);
  });
});
