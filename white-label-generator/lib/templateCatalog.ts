export const templateKeys = ["label_90x120_cn", "label_120x95_cn"] as const;

export type TemplateKey = (typeof templateKeys)[number];

export type TemplateVariant = "en" | "cn";

export type TemplateDefinitionBase = {
  key: TemplateKey;
  name: string;
  sizeLabel: string;
  variant: TemplateVariant;
};

export const templateCatalog: Record<TemplateKey, TemplateDefinitionBase> = {
  label_90x120_cn: {
    key: "label_90x120_cn",
    name: "中文标签 90 × 120 mm",
    sizeLabel: "90mm × 120mm",
    variant: "cn"
  },
  label_120x95_cn: {
    key: "label_120x95_cn",
    name: "中文标签 120 × 95 mm",
    sizeLabel: "120mm × 95mm",
    variant: "cn"
  }
};

export function isTemplateKey(value: string): value is TemplateKey {
  return templateKeys.includes(value as TemplateKey);
}

export function getTemplateMeta(templateKey: string): TemplateDefinitionBase {
  if (!isTemplateKey(templateKey)) {
    throw new Error(`Unsupported template: ${templateKey}`);
  }

  return templateCatalog[templateKey];
}
