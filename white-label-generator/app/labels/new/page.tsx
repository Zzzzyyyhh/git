import { LabelForm } from "@/components/LabelForm";
import { createDefaultProjectPayload } from "@/lib/labelSchema";
import { getTemplateDefaultsMap } from "@/lib/模板默认01";

export default async function NewLabelPage() {
  const templateDefaults = await getTemplateDefaultsMap();
  const initialData = templateDefaults.label_90x120_cn ?? createDefaultProjectPayload().data;

  return <LabelForm initialValue={createDefaultProjectPayload("label_90x120_cn", initialData)} mode="create" templateDefaults={templateDefaults} />;
}
