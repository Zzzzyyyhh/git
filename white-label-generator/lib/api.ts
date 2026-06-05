import { NextResponse } from "next/server";

import { createJsonError } from "@/lib/errors";

export function jsonOk(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(error: unknown) {
  const { status, body } = createJsonError(error);
  return NextResponse.json(body, { status });
}
