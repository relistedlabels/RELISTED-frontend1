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
  "/listers",
  "/admin",
  "/waitlist",
  "/dev",
];

/**
 * Check if navbar/footer should be visible on current route
 */
export const shouldShowNavBar = (pathname: string): boolean => {
  // Hide if it's an explicitly hidden route
  for (const hiddenRoute of HIDDEN_NAVBAR_ROUTES) {
    if (pathname.includes(hiddenRoute)) {
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
