import { jsonError, jsonOk } from "@/lib/api";
import { parseJsonBody } from "@/lib/errors";
import { serializeLabelData } from "@/lib/labelDataStore";
import { labelProjectSchema } from "@/lib/labelSchema";
import { prisma } from "@/lib/prisma";

function buildProjectName(name: string, templateKey: string) {
  const trimmedName = name.trim();
  if (trimmedName) {
    return trimmedName;
  }

  const timestamp = new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());

  return `${templateKey}-${timestamp}`;
}

export async function GET() {
  try {
    const projects = await prisma.labelProject.findMany({
      orderBy: {
        updatedAt: "desc"
      }
    });

    return jsonOk(projects);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const payload = labelProjectSchema.parse(body);
    const project = await prisma.labelProject.create({
      data: {
        name: buildProjectName(payload.name, payload.templateKey),
        templateKey: payload.templateKey,
        status: payload.status,
        data: serializeLabelData(payload.data)
      }
    });

    return jsonOk(project, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
