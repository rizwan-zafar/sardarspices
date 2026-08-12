import { NextResponse } from "next/server";
import { verifyAdminToken, SESSION_COOKIE } from "@/lib/auth";

// Protects every /admin page except the login screen. API routes verify the
// admin session independently inside each Route Handler as a defense-in-depth
// measure (see lib/auth.js -> getAdminSessionFromRequest).
export function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token && verifyAdminToken(token)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? verifyAdminToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
