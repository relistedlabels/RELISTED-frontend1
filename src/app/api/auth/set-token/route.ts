import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { token, userRole } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });

  // Set httpOnly cookie (can't be accessed by JavaScript)
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  // Set user role cookie (readable by middleware)
  if (userRole) {
    response.cookies.set("user_role", userRole, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  }

  return response;
}
