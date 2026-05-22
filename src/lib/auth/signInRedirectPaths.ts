import { PUBLIC_NAVBAR_ROUTES } from "@/lib/navbarRoutes";

/** Marketing/browse routes where guests must not be forced to sign in on 401. */
export function isPublicBrowseRoute(pathname: string): boolean {
  // Navbar uses `/renters` for a marketing page; `/renters/*` app routes stay protected.
  if (pathname.startsWith("/renters/")) return false;
  if (pathname.startsWith("/listers/")) return false;

  for (const publicRoute of PUBLIC_NAVBAR_ROUTES) {
    if (pathname === publicRoute || pathname.startsWith(`${publicRoute}/`)) {
      return true;
    }
  }
  return false;
}

/** Routes where a 401 must not trigger a client redirect to /auth/sign-in */
export function shouldSuppressSignInRedirect(pathname: string): boolean {
  if (pathname.startsWith("/auth/") || pathname === "/auth") return true;
  if (pathname.startsWith("/admin/") || pathname === "/admin") return true;
  if (isPublicBrowseRoute(pathname)) return true;
  return false;
}
