import { type NextRequest, NextResponse } from "next/server";

import { getBasicAuthConfig } from "@/lib/env";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  const auth = getBasicAuthConfig();

  if (!auth.enabled || username !== auth.username || password !== auth.password) {
    const url = new URL("/", request.url);
    url.searchParams.set("error", "invalid");
    return NextResponse.redirect(url, { status: 303 });
  }

  const token = await createSessionToken(username, auth.password);

  const rawNext = formData.get("next")?.toString() ?? "";
  const origin = new URL(request.url).origin;
  let redirectPath = "/labels";
  try {
    const candidate = new URL(rawNext, origin);
    if (candidate.origin === origin) redirectPath = candidate.pathname;
  } catch {
    // rawNext 不是合法路径，使用默认值
  }

  const response = NextResponse.redirect(new URL(redirectPath, request.url), { status: 303 });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === "production"
  });
  return response;
}
