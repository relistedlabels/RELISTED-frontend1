import { describe, expect, test } from "bun:test";
import {
  getOnboardingPathForAuthRole,
  isCheckoutRedirect,
  resolvePostAuthDestination,
  shouldBypassOnboardingForPath,
  shouldRedirectToOnboarding,
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
  test("sends incomplete renters to onboarding", () => {
    expect(
      resolvePostAuthDestination({
        role: "RENTER",
        userId: "user-1",
      }),
    ).toBe("/onboarding/renter");
  });

  test("honors checkout redirect before onboarding", () => {
    expect(
      resolvePostAuthDestination({
        role: "RENTER",
        userId: "user-1",
        redirectUrl: "/shop/cart/checkout?step=2",
      }),
    ).toBe("/shop/cart/checkout?step=2");
  });

  test("prefers onboarding over post-login redirect when incomplete", () => {
    expect(
      resolvePostAuthDestination({
        role: "LISTER",
        userId: "user-2",
        redirectUrl: "/listers/inventory",
        honorRedirect: true,
      }),
    ).toBe("/onboarding/lister");
  });
});

describe("shouldRedirectToOnboarding", () => {
  test("redirects authenticated renters on shop when incomplete", () => {
    expect(
      shouldRedirectToOnboarding({
        pathname: "/shop",
        role: "RENTER",
        userId: "user-redirect-1",
        isAuthenticated: true,
      }),
    ).toBe("/onboarding/renter");
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
