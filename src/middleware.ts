import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simple route protection middleware.
 *
 * How it works:
 * - Checks for a `token` cookie (recommended to be httpOnly and set by your backend) or
 *   a `dev_auth` cookie (development fallback used by the repo).
 * - Blocks access to `/listers` and `/dressers` for unauthenticated users.
 * - Blocks access to `/admin` for users without `user_role=ADMIN` cookie.
 *
 * IMPORTANT: For production security, set an httpOnly cookie containing a session
 * token on successful login and (optionally) a separate `user_role` cookie or have the
 * middleware call a secure server endpoint to validate the token and retrieve the role.
 */

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore next internals, public assets and api routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/public/")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value ?? null;
  const devAuth = req.cookies.get("dev_auth")?.value ?? null;
  const userRole = req.cookies.get("user_role")?.value ?? null;

  // Admin routes: require authenticated + ADMIN role
  if (pathname.startsWith("/admin")) {
    if (!token && !devAuth) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }

    if (userRole !== "ADMIN") {
      // Redirect non-admins to home (or a 403 page if you prefer)
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  // Listers and Dressers: require authentication
  if (pathname.startsWith("/listers") || pathname.startsWith("/dressers")) {
    if (!token && !devAuth) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/listers/:path*", "/dressers/:path*"],
};
