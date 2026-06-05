import { jsonError, jsonOk } from "@/lib/api";
import { parseJsonBody } from "@/lib/errors";
import { templateKeySchema, type LabelData } from "@/lib/labelSchema";
import { saveTemplateDefault } from "@/lib/模板默认01";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<{ templateKey: string; data: LabelData }>(request);
    const templateDefault = await saveTemplateDefault(templateKeySchema.parse(body.templateKey), body.data);

    return jsonOk(templateDefault);
  } catch (error) {
    return jsonError(error);
  }
}
