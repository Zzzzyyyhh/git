import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { exportPng } from "@/lib/export";
import { createExportLabelData, templateKeySchema, type LabelData } from "@/lib/labelSchema";
import { parseJsonBody } from "@/lib/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<{ templateKey: string; data: LabelData }>(request);
    const png = await exportPng({
      templateKey: templateKeySchema.parse(body.templateKey),
      data: createExportLabelData(body.data)
    });

    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="label.png"'
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
