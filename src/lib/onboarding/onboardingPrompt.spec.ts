import { describe, expect, test } from "bun:test";
import {
  ONBOARDING_IDLE_PROMPT_MS,
  isOnboardingTroublePath,
  shouldOfferOnboardingPrompt,
} from "./onboardingPrompt";
describe("isOnboardingTroublePath", () => {
  test("detects cart, checkout, wallet, and account paths", () => {
    expect(isOnboardingTroublePath("/shop/cart")).toBe(true);
    expect(isOnboardingTroublePath("/shop/cart/checkout")).toBe(true);
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
        pathname: "/shop/cart",
        idleMs: 0,
        sessionPromptDismissed: false,
      }),
    ).toBe(true);
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
