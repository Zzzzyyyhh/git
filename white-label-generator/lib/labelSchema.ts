import { z } from "zod";

import { templateKeys } from "@/lib/templateCatalog";

export const labelStatusSchema = z.enum(["draft", "reviewing", "approved", "archived"]);
export const templateKeySchema = z.enum(templateKeys);
export const standardRowKeySchema = z.enum([
  "ingredients",
  "allergenDeclaration",
  "productionDateAndLotNumber",
  "expiryDate",
  "shelfLife",
  "storageCondition",
  "manufacturer",
  "manufacturerAddress",
  "manufacturerTel",
  "importer",
  "importerAddress",
  "importerTel"
]);
export const customRowSizeSchema = z.enum(["compact", "normal", "tall"]);
export const customRowSchema = z.object({
  rowId: z.string().min(1),
  label: z.string().min(1, "自定义行标题必填 / Custom row label is required"),
  value: z.string().min(1, "自定义行内容必填 / Custom row value is required"),
  size: customRowSizeSchema.default("normal")
});
export const label90DetailKeySchema = z.enum([
  "formalName",
  "ingredients",
  "allergen",
  "license",
  "storage",
  "date",
  "consignor",
  "consignorAddress",
  "consignorTel",
  "manufacturer",
  "manufacturerAddress",
  "manufacturerTel",
  "countryOfOrigin",
  "standardCode",
  "usageMethod",
  "shelfLife",
  "customRows"
]);
export const label12095DetailKeySchema = z.enum([
  "formalName",
  "ingredients",
  "allergen",
  "license",
  "standardCode",
  "storage",
  "shelfLife",
  "date",
  "usageMethod",
  "consignor",
  "consignorAddress",
  "consignorTel",
  "manufacturer",
  "countryOfOrigin",
  "manufacturerTel",
  "manufacturerAddress",
  "website"
]);
export const logoKindSchema = z.enum(["none", "image", "text", "custom"]);
export const labelElementBoxSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().positive().default(10),
  height: z.number().positive().default(10),
  fontSize: z.number().positive().default(2)
});
export const logoBoxSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().positive().default(10),
  height: z.number().positive().default(10)
});
export const label90DetailBoxSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().positive().default(10),
  height: z.number().positive().default(4)
});
export const label90LayoutSchema = z.object({
  title: labelElementBoxSchema,
  category: labelElementBoxSchema,
  netWeight: labelElementBoxSchema,
  nutritionTitle: labelElementBoxSchema,
  nutritionHeader: labelElementBoxSchema,
  nutritionRows: labelElementBoxSchema.extend({
    lineHeight: z.number().positive().default(1.22)
  }),
  nutritionRemark: labelElementBoxSchema
});
export const label12095LayoutSchema = z.object({
  title: labelElementBoxSchema,
  category: labelElementBoxSchema,
  netWeight: labelElementBoxSchema,
  nutritionTitle: labelElementBoxSchema,
  nutritionHeader: labelElementBoxSchema,
  nutritionRows: labelElementBoxSchema.extend({
    lineHeight: z.number().positive().default(1.14)
  }),
  nutritionRemark: labelElementBoxSchema
});

export const defaultLabel90HiddenDetails = ["customRows"] satisfies Array<z.infer<typeof label90DetailKeySchema>>;
export const label90DetailFixedLeftMm = 4;
export const defaultLabel12095HiddenDetails = [] satisfies Array<z.infer<typeof label12095DetailKeySchema>>;
export const label12095DetailFixedLeftMm = 4;

export const labelSchema = z.object({
  productName: z.string().default(""),
  productNameCn: z.string().default(""),
  productFormalNameCn: z.string().default(""),
  productCategoryCn: z.string().default(""),
  netWeight: z.string().default(""),
  ingredients: z.string().default(""),
  allergenDeclaration: z.string().default(""),
  productionDateAndLotNumber: z.string().default("See the package"),
  expiryDate: z.string().default("See the package"),
  shelfLife: z.string().default(""),
  storageCondition: z.string().default(""),
  usageMethod: z.string().default(""),
  countryOfOrigin: z.string().default(""),
  productionLicenseNumber: z.string().default(""),
  productStandardCode: z.string().default(""),
  manufacturer: z.string().default(""),
  manufacturerAddress: z.string().default(""),
  manufacturerTel: z.string().default(""),
  consignor: z.string().default(""),
  consignorAddress: z.string().default(""),
  consignorTel: z.string().default(""),
  importer: z.string().default(""),
  importerAddress: z.string().default(""),
  importerTel: z.string().default(""),
  factoryRegistrationNumber: z.string().default(""),
  destinationCountry: z.string().default(""),
  nutritionServingSize: z.string().default(""),
  nutritionEnergy: z.string().default(""),
  nutritionEnergyNrv: z.string().default(""),
  nutritionProtein: z.string().default(""),
  nutritionProteinNrv: z.string().default(""),
  nutritionFat: z.string().default(""),
  nutritionFatNrv: z.string().default(""),
  nutritionSaturatedFat: z.string().default(""),
  nutritionSaturatedFatNrv: z.string().default(""),
  nutritionCarbohydrate: z.string().default(""),
  nutritionCarbohydrateNrv: z.string().default(""),
  nutritionSugar: z.string().default(""),
  nutritionSugarNrv: z.string().default(""),
  nutritionSodium: z.string().default(""),
  nutritionSodiumNrv: z.string().default(""),
  nutritionRemark: z.string().default(""),
  label90NutritionHidden: z.boolean().default(false),
  logoKind: logoKindSchema.default("none"),
  customLogoPng: z.string().default(""),
  logoBoxes: z
    .object({
      label_90x120_cn: logoBoxSchema,
      label_120x95_cn: logoBoxSchema
    })
    .default({
      label_90x120_cn: { x: 61, y: 5, width: 18, height: 12 },
      label_120x95_cn: { x: 26, y: 3.6, width: 16, height: 9.5 }
    }),
  label90DetailFontSizePt: z.number().positive().default(6.8),
  label90DetailLineHeight: z.number().positive().default(1.36),
  label90HiddenDetails: z.array(label90DetailKeySchema).default(defaultLabel90HiddenDetails),
  label90DetailOrder: z.array(label90DetailKeySchema).default([
    "formalName", "ingredients", "allergen", "license", "storage", "date",
    "consignor", "consignorAddress", "consignorTel", "manufacturer",
    "manufacturerAddress", "manufacturerTel", "countryOfOrigin",
    "standardCode", "usageMethod", "shelfLife", "customRows"
  ]),
  label90DetailBoxes: z.object({
    formalName: label90DetailBoxSchema,
    ingredients: label90DetailBoxSchema,
    allergen: label90DetailBoxSchema,
    license: label90DetailBoxSchema,
    storage: label90DetailBoxSchema,
    date: label90DetailBoxSchema,
    consignor: label90DetailBoxSchema,
    consignorAddress: label90DetailBoxSchema,
    consignorTel: label90DetailBoxSchema,
    manufacturer: label90DetailBoxSchema,
    manufacturerAddress: label90DetailBoxSchema,
    manufacturerTel: label90DetailBoxSchema,
    countryOfOrigin: label90DetailBoxSchema,
    standardCode: label90DetailBoxSchema,
    usageMethod: label90DetailBoxSchema,
    shelfLife: label90DetailBoxSchema,
    customRows: label90DetailBoxSchema
  }).default({
    formalName: { x: 5.5, y: 44, width: 78, height: 4.2 },
    ingredients: { x: 5.5, y: 48.3, width: 78, height: 14.5 },
    allergen: { x: 5.5, y: 62.8, width: 78, height: 5.2 },
    license: { x: 5.5, y: 68, width: 45, height: 3.8 },
    storage: { x: 5.5, y: 75.6, width: 43, height: 3.8 },
    date: { x: 5.5, y: 89.5, width: 58, height: 4.2 },
    consignor: { x: 5.5, y: 96.8, width: 45, height: 3.8 },
    consignorAddress: { x: 5.5, y: 100.8, width: 45, height: 3.8 },
    consignorTel: { x: 5.5, y: 104.8, width: 45, height: 3.8 },
    manufacturer: { x: 5.5, y: 108.8, width: 45, height: 3.8 },
    manufacturerAddress: { x: 5.5, y: 112.8, width: 45, height: 3.8 },
    manufacturerTel: { x: 5.5, y: 116, width: 45, height: 3.5 },
    countryOfOrigin: { x: 5.5, y: 116.2, width: 45, height: 3.5 },
    standardCode: { x: 5.5, y: 71.8, width: 45, height: 3.8 },
    usageMethod: { x: 5.5, y: 79.4, width: 38, height: 3.8 },
    shelfLife: { x: 7, y: 83.2, width: 36, height: 4 },
    customRows: { x: 55, y: 71, width: 28, height: 5 }
  }),
  label90Layout: label90LayoutSchema.default({
    title: { x: 10, y: 8.5, width: 70, height: 17, fontSize: 26.6 },
    category: { x: 7, y: 31.5, width: 36, height: 8, fontSize: 17 },
    netWeight: { x: 47, y: 31.5, width: 36, height: 8, fontSize: 17 },
    nutritionTitle: { x: 47, y: 76.4, width: 42, height: 4.8, fontSize: 6.8 },
    nutritionHeader: { x: 47, y: 81.2, width: 42, height: 4.3, fontSize: 6.8 },
    nutritionRows: { x: 47, y: 85.5, width: 42, height: 22.2, fontSize: 6.8, lineHeight: 1.16 },
    nutritionRemark: { x: 47, y: 107.7, width: 42, height: 4.2, fontSize: 6.8 }
  }),
  label12095DetailFontSizePt: z.number().positive().default(6.8),
  label12095DetailLineHeight: z.number().positive().default(1.34),
  label12095HiddenDetails: z.array(label12095DetailKeySchema).default(defaultLabel12095HiddenDetails),
  label12095DetailOrder: z.array(label12095DetailKeySchema).default([
    "formalName", "ingredients", "allergen", "license", "standardCode",
    "storage", "shelfLife", "date", "usageMethod", "consignor",
    "consignorAddress", "consignorTel", "manufacturer", "countryOfOrigin",
    "manufacturerTel", "manufacturerAddress", "website"
  ]),
  label12095DetailBoxes: z.object({
    formalName: label90DetailBoxSchema,
    ingredients: label90DetailBoxSchema,
    allergen: label90DetailBoxSchema,
    license: label90DetailBoxSchema,
    standardCode: label90DetailBoxSchema,
    storage: label90DetailBoxSchema,
    shelfLife: label90DetailBoxSchema,
    date: label90DetailBoxSchema,
    usageMethod: label90DetailBoxSchema,
    consignor: label90DetailBoxSchema.default({ x: 4, y: 76, width: 63, height: 4.1 }),
    consignorAddress: label90DetailBoxSchema.default({ x: 4, y: 80.2, width: 63, height: 4.1 }),
    consignorTel: label90DetailBoxSchema.default({ x: 4, y: 84.4, width: 63, height: 4.1 }),
    manufacturer: label90DetailBoxSchema,
    countryOfOrigin: label90DetailBoxSchema,
    manufacturerTel: label90DetailBoxSchema,
    manufacturerAddress: label90DetailBoxSchema,
    website: label90DetailBoxSchema
  }).default({
    formalName: { x: 4, y: 26.8, width: 63, height: 4.6 },
    ingredients: { x: 4, y: 31.6, width: 63, height: 12.2 },
    allergen: { x: 4, y: 43.8, width: 63, height: 4.5 },
    license: { x: 4, y: 48.6, width: 63, height: 4.1 },
    standardCode: { x: 4, y: 52.8, width: 63, height: 4.1 },
    storage: { x: 4, y: 57, width: 63, height: 4.1 },
    shelfLife: { x: 4, y: 61.2, width: 63, height: 4.1 },
    date: { x: 4, y: 65.4, width: 63, height: 6.2 },
    usageMethod: { x: 4, y: 71.8, width: 63, height: 4.1 },
    consignor: { x: 4, y: 76, width: 63, height: 4.1 },
    consignorAddress: { x: 4, y: 80.2, width: 63, height: 4.1 },
    consignorTel: { x: 4, y: 84.4, width: 63, height: 4.1 },
    manufacturer: { x: 4, y: 76, width: 63, height: 4.1 },
    countryOfOrigin: { x: 4, y: 80.2, width: 63, height: 4.1 },
    manufacturerTel: { x: 4, y: 84.4, width: 63, height: 4.1 },
    manufacturerAddress: { x: 4, y: 88.6, width: 63, height: 4.4 },
    website: { x: 4, y: 92.8, width: 63, height: 3.6 }
  }),
  label12095Layout: label12095LayoutSchema.default({
    title: { x: 49, y: 4.8, width: 43, height: 12.5, fontSize: 34.8 },
    category: { x: 42, y: 17.3, width: 52, height: 8, fontSize: 18.9 },
    netWeight: { x: 74, y: 80.5, width: 40, height: 10.2, fontSize: 22.2 },
    nutritionTitle: { x: 73.7, y: 42.2, width: 39.4, height: 4.4, fontSize: 6.8 },
    nutritionHeader: { x: 73.7, y: 46.6, width: 39.4, height: 4.6, fontSize: 6.8 },
    nutritionRows: { x: 73.7, y: 51.2, width: 39.4, height: 22.8, fontSize: 6.8, lineHeight: 1.14 },
    nutritionRemark: { x: 73.7, y: 74, width: 39.4, height: 4.2, fontSize: 6.8 }
  }),
  hiddenRows: z.array(standardRowKeySchema).default([]),
  customRows: z.array(customRowSchema).default([])
});

export const labelProjectSchema = z.object({
  name: z.string().default(""),
  templateKey: templateKeySchema,
  status: labelStatusSchema.default("draft"),
  data: labelSchema
});

export type LabelData = z.infer<typeof labelSchema>;
export type LabelStatus = z.infer<typeof labelStatusSchema>;
export type LabelProjectPayload = z.infer<typeof labelProjectSchema>;

const emptyLabelDataSeed: LabelData = {
  productName: "",
  productNameCn: "",
  productFormalNameCn: "",
  productCategoryCn: "",
  netWeight: "",
  ingredients: "",
  allergenDeclaration: "",
  productionDateAndLotNumber: "",
  expiryDate: "",
  shelfLife: "",
  storageCondition: "",
  usageMethod: "",
  countryOfOrigin: "",
  productionLicenseNumber: "",
  productStandardCode: "",
  manufacturer: "",
  manufacturerAddress: "",
  manufacturerTel: "",
  consignor: "",
  consignorAddress: "",
  consignorTel: "",
  importer: "",
  importerAddress: "",
  importerTel: "",
  factoryRegistrationNumber: "",
  destinationCountry: "",
  nutritionServingSize: "",
  nutritionEnergy: "",
  nutritionEnergyNrv: "",
  nutritionProtein: "",
  nutritionProteinNrv: "",
  nutritionFat: "",
  nutritionFatNrv: "",
  nutritionSaturatedFat: "",
  nutritionSaturatedFatNrv: "",
  nutritionCarbohydrate: "",
  nutritionCarbohydrateNrv: "",
  nutritionSugar: "",
  nutritionSugarNrv: "",
  nutritionSodium: "",
  nutritionSodiumNrv: "",
  nutritionRemark: "",
  label90NutritionHidden: false,
  logoKind: "none",
  customLogoPng: "",
  logoBoxes: {
    label_90x120_cn: { x: 61, y: 5, width: 18, height: 12 },
    label_120x95_cn: { x: 26, y: 3.6, width: 16, height: 9.5 }
  },
  label90DetailFontSizePt: 6.8,
  label90DetailLineHeight: 1.36,
  label90HiddenDetails: defaultLabel90HiddenDetails,
  label90DetailOrder: [
    "formalName", "ingredients", "allergen", "license", "storage", "date",
    "consignor", "consignorAddress", "consignorTel", "manufacturer",
    "manufacturerAddress", "manufacturerTel", "countryOfOrigin",
    "standardCode", "usageMethod", "shelfLife", "customRows"
  ] as Label90DetailKey[],
  label90DetailBoxes: {
    formalName: { x: 4, y: 44, width: 78, height: 4.2 },
    ingredients: { x: 4, y: 48.3, width: 78, height: 14.5 },
    allergen: { x: 4, y: 62.8, width: 78, height: 5.2 },
    license: { x: 4, y: 68, width: 45, height: 3.8 },
    storage: { x: 4, y: 75.6, width: 43, height: 3.8 },
    date: { x: 4, y: 89.5, width: 58, height: 4.2 },
    consignor: { x: 4, y: 96.8, width: 45, height: 3.8 },
    consignorAddress: { x: 4, y: 100.8, width: 45, height: 3.8 },
    consignorTel: { x: 4, y: 104.8, width: 45, height: 3.8 },
    manufacturer: { x: 4, y: 108.8, width: 45, height: 3.8 },
    manufacturerAddress: { x: 4, y: 112.8, width: 45, height: 3.8 },
    manufacturerTel: { x: 4, y: 116, width: 45, height: 3.5 },
    countryOfOrigin: { x: 4, y: 116.2, width: 45, height: 3.5 },
    standardCode: { x: 4, y: 71.8, width: 45, height: 3.8 },
    usageMethod: { x: 4, y: 79.4, width: 38, height: 3.8 },
    shelfLife: { x: 4, y: 83.2, width: 36, height: 4 },
    customRows: { x: 55, y: 71, width: 28, height: 5 }
  },
  label90Layout: {
    title: { x: 10, y: 8.5, width: 70, height: 17, fontSize: 26.6 },
    category: { x: 7, y: 31.5, width: 36, height: 8, fontSize: 17 },
    netWeight: { x: 47, y: 31.5, width: 36, height: 8, fontSize: 17 },
    nutritionTitle: { x: 47, y: 76.4, width: 42, height: 4.8, fontSize: 6.8 },
    nutritionHeader: { x: 47, y: 81.2, width: 42, height: 4.3, fontSize: 6.8 },
    nutritionRows: { x: 47, y: 85.5, width: 42, height: 22.2, fontSize: 6.8, lineHeight: 1.16 },
    nutritionRemark: { x: 47, y: 107.7, width: 42, height: 4.2, fontSize: 6.8 }
  },
  label12095DetailFontSizePt: 6.8,
  label12095DetailLineHeight: 1.34,
  label12095HiddenDetails: defaultLabel12095HiddenDetails,
  label12095DetailOrder: [
    "formalName", "ingredients", "allergen", "license", "standardCode",
    "storage", "shelfLife", "date", "usageMethod", "consignor",
    "consignorAddress", "consignorTel", "manufacturer", "countryOfOrigin",
    "manufacturerTel", "manufacturerAddress", "website"
  ] as Label12095DetailKey[],
  label12095DetailBoxes: {
    formalName: { x: 4, y: 26.8, width: 63, height: 4.6 },
    ingredients: { x: 4, y: 31.6, width: 63, height: 12.2 },
    allergen: { x: 4, y: 43.8, width: 63, height: 4.5 },
    license: { x: 4, y: 48.6, width: 63, height: 4.1 },
    standardCode: { x: 4, y: 52.8, width: 63, height: 4.1 },
    storage: { x: 4, y: 57, width: 63, height: 4.1 },
    shelfLife: { x: 4, y: 61.2, width: 63, height: 4.1 },
    date: { x: 4, y: 65.4, width: 63, height: 6.2 },
    usageMethod: { x: 4, y: 71.8, width: 63, height: 4.1 },
    consignor: { x: 4, y: 76, width: 63, height: 4.1 },
    consignorAddress: { x: 4, y: 80.2, width: 63, height: 4.1 },
    consignorTel: { x: 4, y: 84.4, width: 63, height: 4.1 },
    manufacturer: { x: 4, y: 76, width: 63, height: 4.1 },
    countryOfOrigin: { x: 4, y: 80.2, width: 63, height: 4.1 },
    manufacturerTel: { x: 4, y: 84.4, width: 63, height: 4.1 },
    manufacturerAddress: { x: 4, y: 88.6, width: 63, height: 4.4 },
    website: { x: 4, y: 92.8, width: 63, height: 3.6 }
  },
  label12095Layout: {
    title: { x: 49, y: 4.8, width: 43, height: 12.5, fontSize: 34.8 },
    category: { x: 42, y: 17.3, width: 52, height: 8, fontSize: 18.9 },
    netWeight: { x: 74, y: 80.5, width: 40, height: 10.2, fontSize: 22.2 },
    nutritionTitle: { x: 73.7, y: 42.2, width: 39.4, height: 4.4, fontSize: 6.8 },
    nutritionHeader: { x: 73.7, y: 46.6, width: 39.4, height: 4.6, fontSize: 6.8 },
    nutritionRows: { x: 73.7, y: 51.2, width: 39.4, height: 22.8, fontSize: 6.8, lineHeight: 1.14 },
    nutritionRemark: { x: 73.7, y: 74, width: 39.4, height: 4.2, fontSize: 6.8 }
  },
  hiddenRows: [],
  customRows: []
};

const exampleLabelDataSeed: LabelData = {
  ...emptyLabelDataSeed,
  productName: "Bibimbap Sauce",
  productNameCn: "韩式拌饭酱",
  productFormalNameCn: "复合调味料",
  productCategoryCn: "复合调味料",
  netWeight: "120g",
  ingredients: "饮用水、辣椒酱、大豆酱、白砂糖、蒜、洋葱、芝麻油、食用盐。",
  allergenDeclaration: "本产品含有大豆、芝麻制品。",
  productionDateAndLotNumber: "见包装喷码",
  expiryDate: "见包装喷码",
  shelfLife: "12个月",
  storageCondition: "置于阴凉干燥处，开封后冷藏并尽快食用。",
  usageMethod: "拌饭、蘸食或烹调调味。",
  countryOfOrigin: "中国 湖南",
  productionLicenseNumber: "SC10343030605044",
  productStandardCode: "SB/T 10439",
  manufacturer: "龙牌食品股份有限公司",
  manufacturerAddress: "湖南省湘潭市湘潭经济技术开发区红星路21号",
  manufacturerTel: "0731-55556666",
  consignor: "龙牌国际贸易有限公司",
  consignorAddress: "上海市闵行区申长路88号",
  consignorTel: "021-68889999",
  importer: "LONGPAI FOODS USA INC.",
  importerAddress: "1234 Market Street, Los Angeles, CA",
  importerTel: "+1 213 555 0123",
  factoryRegistrationNumber: "43030605044",
  destinationCountry: "USA",
  nutritionServingSize: "每份15克",
  nutritionEnergy: "180kJ",
  nutritionEnergyNrv: "2%",
  nutritionProtein: "1.2g",
  nutritionProteinNrv: "2%",
  nutritionFat: "1.0g",
  nutritionFatNrv: "2%",
  nutritionSaturatedFat: "0g",
  nutritionSaturatedFatNrv: "0%",
  nutritionCarbohydrate: "6.5g",
  nutritionCarbohydrateNrv: "2%",
  nutritionSugar: "4.0g",
  nutritionSugarNrv: "",
  nutritionSodium: "320mg",
  nutritionSodiumNrv: "16%",
  nutritionRemark: "儿童青少年应避免过量摄入盐油糖"
};

export function createEmptyLabelData(): LabelData {
  return structuredClone(emptyLabelDataSeed);
}

export function createExampleLabelData(): LabelData {
  return structuredClone(exampleLabelDataSeed);
}

export const defaultLabelData = createEmptyLabelData();

export function createDefaultProjectPayload(templateKey: z.infer<typeof templateKeySchema> = "label_90x120_cn", data = createEmptyLabelData()): LabelProjectPayload {
  return {
    name: "",
    templateKey,
    status: "draft",
    data
  };
}

export const defaultProjectPayload: LabelProjectPayload = createDefaultProjectPayload();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createExportLabelData(raw: unknown): LabelData {
  const base = createEmptyLabelData();
  if (!isRecord(raw)) {
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
    label90DetailOrder: Array.isArray(source.label90DetailOrder) ? (source.label90DetailOrder as LabelData["label90DetailOrder"]) : base.label90DetailOrder,
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
    label12095DetailOrder: Array.isArray(source.label12095DetailOrder) ? (source.label12095DetailOrder as LabelData["label12095DetailOrder"]) : base.label12095DetailOrder,
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

export const fieldCharacterLimits: Partial<Record<keyof LabelData, number>> = {
  productName: 40,
  productNameCn: 10,
  productFormalNameCn: 40,
  productCategoryCn: 14,
  netWeight: 35,
  ingredients: 520,
  allergenDeclaration: 80,
  storageCondition: 140,
  usageMethod: 30,
  productionLicenseNumber: 24,
  productStandardCode: 24,
  manufacturerAddress: 160,
  consignorAddress: 80,
  importerAddress: 120,
  nutritionRemark: 24
};

export const labelFieldLabels: Record<keyof LabelData, string> = {
  productName: "Product Name",
  productNameCn: "中文品名",
  productFormalNameCn: "产品名称",
  productCategoryCn: "产品类别",
  netWeight: "Net Weight",
  ingredients: "Ingredients",
  allergenDeclaration: "Allergen Declaration",
  productionDateAndLotNumber: "Production Date and Lot Number",
  expiryDate: "Expiry Date",
  shelfLife: "Shelf Life",
  storageCondition: "Storage Condition",
  usageMethod: "Usage Method",
  countryOfOrigin: "Country of Origin",
  productionLicenseNumber: "Production License Number",
  productStandardCode: "Product Standard Code",
  manufacturer: "Manufacturer",
  manufacturerAddress: "Manufacturer Address",
  manufacturerTel: "Manufacturer Tel",
  consignor: "Consignor",
  consignorAddress: "Consignor Address",
  consignorTel: "Consignor Tel",
  importer: "Importer",
  importerAddress: "Importer Address",
  importerTel: "Importer Tel",
  factoryRegistrationNumber: "Factory Registration Number",
  destinationCountry: "Destination Country",
  nutritionServingSize: "Nutrition Serving Size",
  nutritionEnergy: "Nutrition Energy",
  nutritionEnergyNrv: "Nutrition Energy NRV",
  nutritionProtein: "Nutrition Protein",
  nutritionProteinNrv: "Nutrition Protein NRV",
  nutritionFat: "Nutrition Fat",
  nutritionFatNrv: "Nutrition Fat NRV",
  nutritionSaturatedFat: "Nutrition Saturated Fat",
  nutritionSaturatedFatNrv: "Nutrition Saturated Fat NRV",
  nutritionCarbohydrate: "Nutrition Carbohydrate",
  nutritionCarbohydrateNrv: "Nutrition Carbohydrate NRV",
  nutritionSugar: "Nutrition Sugar",
  nutritionSugarNrv: "Nutrition Sugar NRV",
  nutritionSodium: "Nutrition Sodium",
  nutritionSodiumNrv: "Nutrition Sodium NRV",
  nutritionRemark: "Nutrition Remark",
  label90NutritionHidden: "Label 90 Nutrition Hidden",
  logoKind: "Logo Kind",
  customLogoPng: "Custom Logo PNG",
  logoBoxes: "Logo Boxes",
  label90DetailFontSizePt: "Label 90 Detail Font Size",
  label90DetailLineHeight: "Label 90 Detail Line Height",
  label90HiddenDetails: "Label 90 Hidden Details",
  label90DetailBoxes: "Label 90 Detail Boxes",
  label90DetailOrder: "Label 90 Detail Order",
  label90Layout: "Label 90 Layout",
  label12095DetailFontSizePt: "Label 120x95 Detail Font Size",
  label12095DetailLineHeight: "Label 120x95 Detail Line Height",
  label12095HiddenDetails: "Label 120x95 Hidden Details",
  label12095DetailBoxes: "Label 120x95 Detail Boxes",
  label12095DetailOrder: "Label 120x95 Detail Order",
  label12095Layout: "Label 120x95 Layout",
  hiddenRows: "Hidden Rows",
  customRows: "Custom Rows"
};

export const standardRows = [
  { key: "ingredients", label: "配料 / Ingredients" },
  { key: "allergenDeclaration", label: "过敏原信息 / Allergen Declaration" },
  { key: "productionDateAndLotNumber", label: "生产日期批号 / Production Date / Lot No." },
  { key: "expiryDate", label: "到期日 / Expiry Date" },
  { key: "shelfLife", label: "保质期 / Shelf Life" },
  { key: "storageCondition", label: "贮存条件 / Storage Condition" },
  { key: "manufacturer", label: "生产商 / Manufacturer" },
  { key: "manufacturerAddress", label: "生产商地址 / Manufacturer Address" },
  { key: "manufacturerTel", label: "生产商电话 / Manufacturer Tel" },
  { key: "importer", label: "进口商 / Importer" },
  { key: "importerAddress", label: "进口商地址 / Importer Address" },
  { key: "importerTel", label: "进口商电话 / Importer Tel" }
] as const;

export type StandardRowKey = z.infer<typeof standardRowKeySchema>;
export type CustomRow = z.infer<typeof customRowSchema>;
export type CustomRowSize = z.infer<typeof customRowSizeSchema>;
export type Label90DetailKey = z.infer<typeof label90DetailKeySchema>;
export type Label12095DetailKey = z.infer<typeof label12095DetailKeySchema>;
export type LabelElementBox = z.infer<typeof labelElementBoxSchema>;
export type LogoKind = z.infer<typeof logoKindSchema>;
export type LogoBox = z.infer<typeof logoBoxSchema>;
export type Label90Layout = z.infer<typeof label90LayoutSchema>;
export type Label12095Layout = z.infer<typeof label12095LayoutSchema>;
