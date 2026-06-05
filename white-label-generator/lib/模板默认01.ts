import { createEmptyLabelData, type LabelData } from "@/lib/labelSchema";
import { prisma } from "@/lib/prisma";
import type { TemplateKey } from "@/lib/templateCatalog";

export async function getTemplateDefaultsMap() {
  const defaults = await prisma.templateDefault.findMany();

  return Object.fromEntries(
    defaults.map((item) => [item.templateKey, deserializeTemplateDefaultData(item.data)])
  ) as Partial<Record<TemplateKey, LabelData>>;
}

export async function saveTemplateDefault(templateKey: TemplateKey, data: LabelData) {
  return prisma.templateDefault.upsert({
    where: { templateKey },
    update: {
      data: serializeTemplateDefaultData(data)
    },
    create: {
      templateKey,
      data: serializeTemplateDefaultData(data)
    }
  });
}

function serializeTemplateDefaultData(data: LabelData) {
  return JSON.stringify(mergeTemplateDefaultData(data));
}

function deserializeTemplateDefaultData(data: string) {
  return mergeTemplateDefaultData(JSON.parse(data));
}

function mergeTemplateDefaultData(raw: unknown): LabelData {
  const base = createEmptyLabelData();
  if (!raw || typeof raw !== "object") {
    return base;
  }

  const source = raw as Record<string, unknown>;

  return {
    ...base,
    ...source,
    label90NutritionHidden: typeof source.label90NutritionHidden === "boolean" ? source.label90NutritionHidden : base.label90NutritionHidden,
    logoBoxes: {
      ...base.logoBoxes,
      ...(isRecord(source.logoBoxes) ? source.logoBoxes : {})
    },
    label90HiddenDetails: Array.isArray(source.label90HiddenDetails) ? (source.label90HiddenDetails as LabelData["label90HiddenDetails"]) : base.label90HiddenDetails,
    label90DetailBoxes: {
      ...base.label90DetailBoxes,
      ...(isRecord(source.label90DetailBoxes) ? source.label90DetailBoxes : {})
    },
    label90Layout: {
      ...base.label90Layout,
      ...(isRecord(source.label90Layout) ? source.label90Layout : {})
    },
    label12095HiddenDetails: Array.isArray(source.label12095HiddenDetails)
      ? (source.label12095HiddenDetails as LabelData["label12095HiddenDetails"])
      : base.label12095HiddenDetails,
    label12095DetailBoxes: {
      ...base.label12095DetailBoxes,
      ...(isRecord(source.label12095DetailBoxes) ? source.label12095DetailBoxes : {})
    },
    label12095Layout: {
      ...base.label12095Layout,
      ...(isRecord(source.label12095Layout) ? source.label12095Layout : {})
    },
    hiddenRows: Array.isArray(source.hiddenRows) ? (source.hiddenRows as LabelData["hiddenRows"]) : base.hiddenRows,
    customRows: Array.isArray(source.customRows) ? (source.customRows as LabelData["customRows"]) : base.customRows
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
