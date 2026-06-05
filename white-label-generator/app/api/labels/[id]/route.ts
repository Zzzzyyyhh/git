import { jsonError, jsonOk } from "@/lib/api";
import { AppError, parseJsonBody } from "@/lib/errors";
import { serializeLabelData } from "@/lib/labelDataStore";
import { labelProjectSchema, labelStatusSchema } from "@/lib/labelSchema";
import { prisma } from "@/lib/prisma";

function buildProjectName(name: string, templateKey: string, fallbackName: string) {
  const trimmedName = name.trim();
  if (trimmedName) {
    return trimmedName;
  }

  return fallbackName || templateKey;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const project = await prisma.labelProject.findUnique({
      where: {
        id
      }
    });

    if (!project) {
      throw new AppError("PROJECT_NOT_FOUND", "标签项目不存在。", 404);
    }

    return jsonOk(project);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.labelProject.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError("PROJECT_NOT_FOUND", "标签项目不存在。", 404);
    }

    const body = await parseJsonBody(request);
    const payload = labelProjectSchema.parse(body);
    const project = await prisma.labelProject.update({
      where: { id },
      data: {
        name: buildProjectName(payload.name, payload.templateKey, existing.name),
        templateKey: payload.templateKey,
        status: payload.status,
        data: serializeLabelData(payload.data)
      }
    });

    return jsonOk(project);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.labelProject.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError("PROJECT_NOT_FOUND", "标签项目不存在。", 404);
    }

    const body = await parseJsonBody<{ status?: string; name?: string }>(request);
    const data: { status?: string; name?: string } = {};

    if (typeof body.status === "string") {
      data.status = labelStatusSchema.parse(body.status);
    }

    if (typeof body.name === "string") {
      data.name = body.name.trim() || existing.name;
    }

    const project = await prisma.labelProject.update({
      where: { id },
      data
    });

    return jsonOk(project);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.labelProject.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError("PROJECT_NOT_FOUND", "标签项目不存在。", 404);
    }

    await prisma.labelProject.delete({ where: { id } });
    return jsonOk({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
