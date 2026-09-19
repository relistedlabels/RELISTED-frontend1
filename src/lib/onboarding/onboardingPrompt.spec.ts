import { describe, expect, test } from "bun:test";
import {
  ONBOARDING_IDLE_PROMPT_MS,
  isOnboardingTroublePath,
  shouldOfferOnboardingPrompt,
} from "./onboardingPrompt";
describe("isOnboardingTroublePath", () => {
  test("detects wallet and account paths but not cart or checkout", () => {
    expect(isOnboardingTroublePath("/shop/cart")).toBe(false);
    expect(isOnboardingTroublePath("/shop/cart/checkout")).toBe(false);
    expect(isOnboardingTroublePath("/renters/wallet")).toBe(true);
    expect(isOnboardingTroublePath("/")).toBe(false);
  });
});

describe("shouldOfferOnboardingPrompt", () => {
  test("offers prompt on trouble paths immediately", () => {
    expect(
      shouldOfferOnboardingPrompt({
        userId: "user-trouble",
        role: "renter",
        pathname: "/renters/wallet",
        idleMs: 0,
        sessionPromptDismissed: false,
      }),
    ).toBe(true);
  });

  test("does not offer prompt on checkout", () => {
    expect(
      shouldOfferOnboardingPrompt({
        userId: "user-checkout",
        role: "renter",
        pathname: "/shop/cart/checkout",
        idleMs: ONBOARDING_IDLE_PROMPT_MS,
        sessionPromptDismissed: false,
      }),
    ).toBe(false);
  });

  test("offers prompt after idle threshold", () => {
    expect(
      shouldOfferOnboardingPrompt({
        userId: "user-idle",
        role: "renter",
        pathname: "/shop",
        idleMs: ONBOARDING_IDLE_PROMPT_MS,
        sessionPromptDismissed: false,
      }),
    ).toBe(true);
  });

  test("does not offer prompt when session dismissed", () => {
    expect(
      shouldOfferOnboardingPrompt({
        userId: "user-session",
        role: "renter",
        pathname: "/shop/cart",
        idleMs: ONBOARDING_IDLE_PROMPT_MS,
        sessionPromptDismissed: true,
      }),
    ).toBe(false);
  });
});
