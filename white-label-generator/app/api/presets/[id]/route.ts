import { jsonError, jsonOk } from "@/lib/api";
import { labelSchema } from "@/lib/labelSchema";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const preset = await prisma.labelPreset.findUniqueOrThrow({ where: { id } });
    return jsonOk({ id: preset.id, name: preset.name, templateKey: preset.templateKey, data: labelSchema.parse(JSON.parse(preset.data)) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.labelPreset.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
