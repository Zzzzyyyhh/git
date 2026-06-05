import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { exportPdf } from "@/lib/export";
import { createExportLabelData, templateKeySchema, type LabelData } from "@/lib/labelSchema";
import { parseJsonBody } from "@/lib/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<{ templateKey: string; data: LabelData }>(request);
    const pdf = await exportPdf({
      templateKey: templateKeySchema.parse(body.templateKey),
      data: createExportLabelData(body.data)
    });

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="label.pdf"'
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
