import type { ComponentType } from "react";

import { CartonLabel120 } from "@/components/templates/CartonLabel120";
import { 标签90 } from "@/components/templates/标签90";
import { 标签95_01 } from "@/components/templates/标签95_01";
import type { LabelData } from "@/lib/labelSchema";
import { getTemplateMeta, templateCatalog, type TemplateDefinitionBase, type TemplateKey } from "@/lib/templateCatalog";

export type TemplateDefinition = TemplateDefinitionBase & {
  Component: ComponentType<{ data: LabelData; templateKey: TemplateKey }>;
};

export const templates: Record<TemplateKey, TemplateDefinition> = {
  carton_120_square: {
    ...templateCatalog.carton_120_square,
    Component: CartonLabel120
  },
  carton_120_square_cn: {
    ...templateCatalog.carton_120_square_cn,
    Component: CartonLabel120
  },
  label_90x120_cn: {
    ...templateCatalog.label_90x120_cn,
    Component: 标签90
  },
  label_120x95_cn: {
    ...templateCatalog.label_120x95_cn,
    Component: 标签95_01
  }
};

export function getTemplate(templateKey: string): TemplateDefinition {
  const meta = getTemplateMeta(templateKey);
  return templates[meta.key];
}
