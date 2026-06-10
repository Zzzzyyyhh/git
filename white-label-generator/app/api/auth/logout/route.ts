import { type NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/session";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export async function POST(request: NextRequest) {
  return GET(request);
}
