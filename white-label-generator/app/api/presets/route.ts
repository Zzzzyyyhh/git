import { jsonError, jsonOk } from "@/lib/api";
import { parseJsonBody } from "@/lib/errors";
import { labelSchema, templateKeySchema } from "@/lib/labelSchema";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  try {
    const presets = await prisma.labelPreset.findMany({
      select: { id: true, name: true, templateKey: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });
    return jsonOk(presets);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<{ name: string; templateKey: string; data: unknown }>(request);
    const name = z.string().min(1).max(60).trim().parse(body.name);
    const templateKey = templateKeySchema.parse(body.templateKey);
    const data = labelSchema.parse(body.data);
    const preset = await prisma.labelPreset.create({
      data: { name, templateKey, data: JSON.stringify(data) }
    });
    return jsonOk({ id: preset.id, name: preset.name, templateKey: preset.templateKey, createdAt: preset.createdAt });
  } catch (error) {
    return jsonError(error);
  }
}
