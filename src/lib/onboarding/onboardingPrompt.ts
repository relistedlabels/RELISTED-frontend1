import type { OnboardingRole } from "./onboardingStorage";
import { isOnboardingAutoPromptSuppressed } from "./onboardingStorage";

/** How long a user can browse before we offer the tour (ms). */
export const ONBOARDING_IDLE_PROMPT_MS = 90_000;

/** Paths that suggest the user may need guidance. */
export const ONBOARDING_TROUBLE_PATH_PREFIXES = [
  "/shop/cart/checkout",
  "/shop/cart",
  "/renters/wallet",
  "/renters/account",
  "/listers/inventory/product-upload",
  "/listers/wallet",
  "/listers/settings",
] as const;

const SESSION_PROMPT_DISMISSED_KEY = "relisted-onboarding-prompt-dismissed";

export function isSessionOnboardingPromptDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_PROMPT_DISMISSED_KEY) === "1";
}

export function dismissSessionOnboardingPrompt(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_PROMPT_DISMISSED_KEY, "1");
}

export function isOnboardingTroublePath(pathname: string): boolean {
  return ONBOARDING_TROUBLE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function shouldOfferOnboardingPrompt(options: {
  userId: string | null;
  role: OnboardingRole;
  pathname: string;
  idleMs: number;
  sessionPromptDismissed: boolean;
}): boolean {
  const { userId, role, pathname, idleMs, sessionPromptDismissed } = options;

  if (sessionPromptDismissed) return false;
  if (isOnboardingAutoPromptSuppressed(userId, role)) return false;

  if (pathname.startsWith("/onboarding") || pathname.startsWith("/auth")) {
    return false;
  }

  if (isOnboardingTroublePath(pathname)) {
    return true;
  }

  return idleMs >= ONBOARDING_IDLE_PROMPT_MS;
}

export type OnboardingPromptReason = "idle" | "trouble";

export function onboardingPromptReason(options: {
  pathname: string;
  idleMs: number;
}): OnboardingPromptReason {
  if (isOnboardingTroublePath(options.pathname)) {
    return "trouble";
  }
  return "idle";
}

export function onboardingPromptCopy(reason: OnboardingPromptReason): {
  title: string;
  body: string;
} {
  if (reason === "trouble") {
    return {
      title: "Need a hand?",
      body: "Take a quick tour to see how renting, buying, and checkout work on Relisted.",
    };
  }

  return {
    title: "New here?",
    body: "Take a two-minute tour to learn how Relisted works before you dive in.",
  };
}
