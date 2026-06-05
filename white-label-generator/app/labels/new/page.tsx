import { LabelForm } from "@/components/LabelForm";
import { createDefaultProjectPayload } from "@/lib/labelSchema";
import { getTemplateDefaultsMap } from "@/lib/模板默认01";

export default async function NewLabelPage() {
  const templateDefaults = await getTemplateDefaultsMap();
  const initialData = templateDefaults.carton_120_square ?? createDefaultProjectPayload().data;

  return <LabelForm initialValue={createDefaultProjectPayload("carton_120_square", initialData)} mode="create" templateDefaults={templateDefaults} />;
}
