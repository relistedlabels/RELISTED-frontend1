/**
 * List of routes where the navbar/footer should be visible
 */
export const PUBLIC_NAVBAR_ROUTES = [
  "/",
  "/shop",
  "/style-spotlight",
  "/how-it-works",
  "/about",
  "/contact-us",
  "/privacy-policy",
  "/terms-and-conditions",
  "/lister-profile",
  "/listers-marketplace",
  "/renters",
];

/**
 * Routes that should hide the navbar/footer
 */
export const HIDDEN_NAVBAR_ROUTES = [
  "/auth",
  "/onboarding",
  "/listers",
  "/admin",
  "/waitlist",
  "/dev",
];

/** Routes where mobile bottom tab bar is shown (shopping experience). */
export const MOBILE_BOTTOM_NAV_ROUTES = [
  "/",
  "/shop",
  "/renters/account",
  "/renters/orders",
  "/renters/wallet",
  "/style-spotlight",
  "/how-it-works",
  "/lister-profile",
];

export const shouldShowMobileBottomNav = (pathname: string): boolean => {
  if (pathname.startsWith("/shop/availability")) return true;
  for (const route of MOBILE_BOTTOM_NAV_ROUTES) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return true;
    }
  }
  return false;
};

/**
 * Check if navbar/footer should be visible on current route
 */
export const shouldShowNavBar = (pathname: string): boolean => {
  // Hide if it's an explicitly hidden route (must be exact match or start with route + "/")
  for (const hiddenRoute of HIDDEN_NAVBAR_ROUTES) {
    if (pathname === hiddenRoute || pathname.startsWith(hiddenRoute + "/")) {
      return false;
    }
  }

  // Show only if it's a known public route or starts with a public route
  for (const publicRoute of PUBLIC_NAVBAR_ROUTES) {
    if (pathname === publicRoute || pathname.startsWith(publicRoute + "/")) {
      return true;
    }
  }

  // Hide everything else (including not-found pages)
  return false;
};
