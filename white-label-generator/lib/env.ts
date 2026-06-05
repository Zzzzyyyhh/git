import { AppError } from "@/lib/errors";

export function getBasicAuthConfig() {
  const username = process.env.BASIC_AUTH_USER?.trim() ?? "";
  const password = process.env.BASIC_AUTH_PASS?.trim() ?? "";

  return {
    enabled: Boolean(username && password),
    username,
    password
  };
}

export function requireAppUrl() {
  const value = process.env.APP_URL?.trim();

  if (!value) {
    throw new AppError("MISSING_APP_URL", "缺少 APP_URL 环境变量。", 500);
  }

  return value;
}
