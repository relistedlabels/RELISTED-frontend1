import {
  type OnboardingRole,
  hasActiveOnboardingTask,
  isOnboardingAutoPromptSuppressed,
} from "./onboardingStorage";

export function authRoleToOnboardingRole(
  role: string | null | undefined,
): OnboardingRole | null {
  if (role === "LISTER") return "lister";
  if (role === "RENTER") return "renter";
  return null;
}

export function getOnboardingPathForAuthRole(
  role: string | null | undefined,
): string | null {
  const onboardingRole = authRoleToOnboardingRole(role);
  if (!onboardingRole) return null;
  return `/onboarding/${onboardingRole}`;
}

const BYPASS_PREFIXES = [
  "/auth",
  "/onboarding",
  "/admin",
  "/shop/cart/checkout",
  "/waitlist",
  "/dev",
] as const;

const ACTIVE_TASK_BYPASS_PREFIXES = [
  "/listers/settings",
  "/listers/inventory/product-upload",
  "/listers/wallet",
  "/renters/account",
  "/renters/wallet",
] as const;

export function shouldBypassOnboardingForPath(
  pathname: string,
  options?: {
    hasActiveTask?: boolean;
  },
): boolean {
  if (
    options?.hasActiveTask &&
    ACTIVE_TASK_BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return true;
  }

  return BYPASS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function pathnameFromRedirectUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      return new URL(url).pathname;
    } catch {
      return url.split("?")[0] || url;
    }
  }
  return url.split("?")[0] || url;
}

export function isCheckoutRedirect(url: string): boolean {
  const path = pathnameFromRedirectUrl(url);
  return (
    path === "/shop/cart/checkout" || path.startsWith("/shop/cart/checkout/")
  );
}

/** Post-auth: browse-first. Users land on shop or dashboard, not forced onboarding. */
export function resolvePostAuthDestination(options: {
  role: string | null | undefined;
  userId: string | null;
  redirectUrl?: string | null;
  honorRedirect?: boolean;
}): string {
  const { role, redirectUrl, honorRedirect = false } = options;

  if (redirectUrl && isCheckoutRedirect(redirectUrl)) {
    return redirectUrl;
  }

  if (role === "ADMIN") {
    if (honorRedirect && redirectUrl) return redirectUrl;
    return "/";
  }

  if (honorRedirect && redirectUrl) {
    return redirectUrl;
  }

  if (role === "LISTER") {
    return "/listers/dashboard";
  }

  return "/shop";
}

/**
 * Forced onboarding redirects are disabled. Users browse first; optional prompts
 * are handled by OnboardingPromptGuard.
 */
export function shouldRedirectToOnboarding(_options: {
  pathname: string;
  role: string | null | undefined;
  userId: string | null;
  isAuthenticated: boolean;
}): string | null {
  return null;
}

export function shouldShowOnboardingPromptForUser(options: {
  role: string | null | undefined;
  userId: string | null;
  isAuthenticated: boolean;
}): boolean {
  const { role, userId, isAuthenticated } = options;
  if (!isAuthenticated) return false;
  if (role === "ADMIN") return false;

  const onboardingRole = authRoleToOnboardingRole(role);
  if (!onboardingRole) return false;

  return !isOnboardingAutoPromptSuppressed(userId, onboardingRole);
}
