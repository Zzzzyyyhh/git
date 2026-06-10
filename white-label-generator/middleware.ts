import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getBasicAuthConfig } from "@/lib/env";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

function isPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/商标") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  );
}

export async function middleware(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const auth = getBasicAuthConfig();
  if (!auth.enabled) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token && (await verifySessionToken(token, auth.username, auth.password))) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"]
};
