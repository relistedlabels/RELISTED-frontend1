import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
  // if (pathname.startsWith("/listers") || pathname.startsWith("/renters")) {
  //   if (!token && !devAuth) {
  //     return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  //   }
  //   return NextResponse.next();
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/listers/:path*", "/renters/:path*"],
};
