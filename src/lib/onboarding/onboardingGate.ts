import {
  type OnboardingRole,
  isOnboardingComplete,
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

export function shouldBypassOnboardingForPath(pathname: string): boolean {
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

export function resolvePostAuthDestination(options: {
  role: string | null | undefined;
  userId: string | null;
  redirectUrl?: string | null;
  honorRedirect?: boolean;
}): string {
  const { role, userId, redirectUrl, honorRedirect = false } = options;

  if (redirectUrl && isCheckoutRedirect(redirectUrl)) {
    return redirectUrl;
  }

  if (role === "ADMIN") {
    if (honorRedirect && redirectUrl) return redirectUrl;
    return "/";
  }

  const onboardingRole = authRoleToOnboardingRole(role);
  const onboardingPath = getOnboardingPathForAuthRole(role);

  if (
    onboardingPath &&
    onboardingRole &&
    !isOnboardingComplete(userId, onboardingRole)
  ) {
    return onboardingPath;
  }

  if (honorRedirect && redirectUrl) {
    return redirectUrl;
  }

  if (role === "LISTER") {
    return "/listers/dashboard";
  }

  return "/";
}

export function shouldRedirectToOnboarding(options: {
  pathname: string;
  role: string | null | undefined;
  userId: string | null;
  isAuthenticated: boolean;
}): string | null {
  const { pathname, role, userId, isAuthenticated } = options;

  if (!isAuthenticated) return null;
  if (role === "ADMIN") return null;
  if (shouldBypassOnboardingForPath(pathname)) return null;

  const onboardingRole = authRoleToOnboardingRole(role);
  if (!onboardingRole) return null;
  if (isOnboardingComplete(userId, onboardingRole)) return null;

  return getOnboardingPathForAuthRole(role);
}
