import { jsonError, jsonOk } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.labelProject.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError("PROJECT_NOT_FOUND", "标签项目不存在。", 404);
    }

    const project = await prisma.labelProject.create({
      data: {
        name: `${existing.name} - 副本`,
        templateKey: existing.templateKey,
        status: "draft",
        data: existing.data
      }
    });

    return jsonOk(project, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
