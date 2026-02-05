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

  // Admin auth routes: public (no auth required)
  if (pathname.match(/^\/admin\/[^/]+\/auth\//)) {
    return NextResponse.next();
  }

  // Admin routes: require authenticated + ADMIN role
  if (pathname.startsWith("/admin")) {
    if (!token && !devAuth) {
      // Rewrite to not-found page for users without token
      return NextResponse.rewrite(new URL("/not-found", req.url), {
        status: 404,
      });
    }

    if (userRole !== "ADMIN") {
      // Rewrite to not-found page for non-admins
      return NextResponse.rewrite(new URL("/not-found", req.url), {
        status: 404,
      });
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
