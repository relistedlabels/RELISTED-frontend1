/** Routes where a 401 must not trigger a client redirect to /auth/sign-in */
export function shouldSuppressSignInRedirect(pathname: string): boolean {
  if (pathname.startsWith("/auth/") || pathname === "/auth") return true;
  if (pathname.startsWith("/admin/") || pathname === "/admin") return true;
  return false;
}
