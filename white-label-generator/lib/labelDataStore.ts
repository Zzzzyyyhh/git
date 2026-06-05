import { defaultLabel90HiddenDetails, labelSchema, type LabelData } from "@/lib/labelSchema";

export function serializeLabelData(data: LabelData) {
  return JSON.stringify(normalizeLabelData(labelSchema.parse(data)));
}

export function deserializeLabelData(data: string) {
  return normalizeLabelData(labelSchema.parse(JSON.parse(data)));
}

function normalizeLabelData(data: LabelData): LabelData {
  const titleFont = data.label90Layout.title.fontSize;
  const categoryFont = data.label90Layout.category.fontSize;
  const title120Font = data.label12095Layout.title.fontSize;
  const category120Font = data.label12095Layout.category.fontSize;
  const shouldCompactNutrition =
    (data.label90Layout.nutritionRows.height >= 20 && data.label90Layout.nutritionRemark.y >= 110) ||
    (data.label90Layout.nutritionRows.height >= 13.5 && data.label90Layout.nutritionRemark.y >= 99) ||
    data.label90Layout.nutritionTitle.width <= 35;

  const baseData =
    titleFont > 15 || categoryFont > 10
      ? data
      : {
          ...data,
          label90Layout: {
            ...data.label90Layout,
            title: { ...data.label90Layout.title, fontSize: toPt(data.label90Layout.title.fontSize) },
            category: { ...data.label90Layout.category, fontSize: toPt(data.label90Layout.category.fontSize) },
            netWeight: { ...data.label90Layout.netWeight, fontSize: toPt(data.label90Layout.netWeight.fontSize) },
            nutritionTitle: { ...data.label90Layout.nutritionTitle, fontSize: toPt(data.label90Layout.nutritionTitle.fontSize) },
            nutritionHeader: { ...data.label90Layout.nutritionHeader, fontSize: toPt(data.label90Layout.nutritionHeader.fontSize) },
            nutritionRows: { ...data.label90Layout.nutritionRows, fontSize: toPt(data.label90Layout.nutritionRows.fontSize) },
            nutritionRemark: { ...data.label90Layout.nutritionRemark, fontSize: toPt(data.label90Layout.nutritionRemark.fontSize) }
          },
          label90DetailFontSizePt: toPt(data.label90DetailFontSizePt)
        };

  const baseData120 =
    title120Font > 15 || category120Font > 10
      ? baseData
      : {
          ...baseData,
          label12095Layout: {
            ...baseData.label12095Layout,
            title: { ...baseData.label12095Layout.title, fontSize: toPt(baseData.label12095Layout.title.fontSize) },
            category: { ...baseData.label12095Layout.category, fontSize: toPt(baseData.label12095Layout.category.fontSize) },
            netWeight: { ...baseData.label12095Layout.netWeight, fontSize: toPt(baseData.label12095Layout.netWeight.fontSize) },
            nutritionTitle: { ...baseData.label12095Layout.nutritionTitle, fontSize: toPt(baseData.label12095Layout.nutritionTitle.fontSize) },
            nutritionHeader: { ...baseData.label12095Layout.nutritionHeader, fontSize: toPt(baseData.label12095Layout.nutritionHeader.fontSize) },
            nutritionRows: { ...baseData.label12095Layout.nutritionRows, fontSize: toPt(baseData.label12095Layout.nutritionRows.fontSize) },
            nutritionRemark: { ...baseData.label12095Layout.nutritionRemark, fontSize: toPt(baseData.label12095Layout.nutritionRemark.fontSize) }
          },
          label12095DetailFontSizePt: toPt(baseData.label12095DetailFontSizePt)
        };

  const hiddenDetailData =
    baseData120.label90HiddenDetails.length > 0
      ? baseData120
      : {
          ...baseData120,
          label90HiddenDetails: defaultLabel90HiddenDetails
        };

  if (!shouldCompactNutrition) {
    return hiddenDetailData;
  }

  return {
    ...hiddenDetailData,
    label90Layout: {
      ...hiddenDetailData.label90Layout,
      nutritionTitle: { ...hiddenDetailData.label90Layout.nutritionTitle, x: 47, y: 76.4, width: 42, height: 4.8, fontSize: 6.8 },
      nutritionHeader: { ...hiddenDetailData.label90Layout.nutritionHeader, x: 47, y: 81.2, width: 42, height: 4.3, fontSize: 6.8 },
      nutritionRows: { ...hiddenDetailData.label90Layout.nutritionRows, x: 47, y: 85.5, width: 42, height: 22.2, fontSize: 6.8, lineHeight: 1.16 },
      nutritionRemark: { ...hiddenDetailData.label90Layout.nutritionRemark, x: 47, y: 107.7, width: 42, height: 4.2, fontSize: 6.8 }
    }
  };
}

function toPt(value: number) {
  return Number((value * 2.83465).toFixed(1));
}
