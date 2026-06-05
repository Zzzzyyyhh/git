import { readFileSync } from "node:fs";
import path from "node:path";

import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

import { AppError } from "@/lib/errors";
import {
  createExportLabelData,
  label12095DetailFixedLeftMm,
  label90DetailFixedLeftMm,
  labelSchema,
  templateKeySchema,
  type CustomRow,
  type CustomRowSize,
  type Label12095DetailKey,
  type LabelData,
  type LogoKind,
  type StandardRowKey
} from "@/lib/labelSchema";
import { getTemplateMeta, type TemplateKey } from "@/lib/templateCatalog";
import { label12095DetailLabels, label12095DetailOrder, renderLabel12095DetailValue } from "@/lib/中文模板120_01";

type ExportPayload = {
  templateKey: string;
  data: LabelData;
};

type TemplateCopy = {
  primaryTitle: (data: LabelData) => string;
  secondaryTitle: (data: LabelData) => string;
  netWeight: string;
  countryOfOrigin: string;
  ingredients: string;
  allergenDeclaration: string;
  productionDateAndLotNumber: string;
  expiryDate: string;
  shelfLife: string;
  storageCondition: string;
  manufacturer: string;
  manufacturerAddress: string;
  manufacturerTel: string;
  importer: string;
  importerAddress: string;
  importerTel: string;
  factoryRegistrationNumber: string;
  destinationCountry: string;
};

type RowDefinition = {
  key: string;
  label: string;
  value: string;
  minHeight: string;
  fontSize?: string;
};

type PageSize = {
  width: string;
  height: string;
  viewportWidth: number;
  viewportHeight: number;
};

type PdfSheetConfig = {
  width: string;
  height: string;
  viewportWidth: number;
  viewportHeight: number;
  columnGap: string;
  rowGap: string;
  landscape: boolean;
};

const 主标签字符高度 = "8.5mm";
const 详情字符高度 = "3.5mm";
const 营养表字符高度 = "3.5mm";
const 营养表列模板 = "max-content max-content max-content";
const 营养表列间距 = "1mm";

const copyByVariant: Record<"en" | "cn", TemplateCopy> = {
  en: {
    primaryTitle: (data) => data.productName,
    secondaryTitle: (data) => data.productNameCn,
    netWeight: "NET WEIGHT",
    countryOfOrigin: "COUNTRY OF ORIGIN",
    ingredients: "INGREDIENTS",
    allergenDeclaration: "ALLERGEN DECLARATION",
    productionDateAndLotNumber: "PRODUCTION DATE / LOT NO.",
    expiryDate: "EXPIRY DATE",
    shelfLife: "SHELF LIFE",
    storageCondition: "STORAGE CONDITION",
    manufacturer: "MANUFACTURER",
    manufacturerAddress: "MANUFACTURER ADDRESS",
    manufacturerTel: "MANUFACTURER TEL",
    importer: "IMPORTER",
    importerAddress: "IMPORTER ADDRESS",
    importerTel: "IMPORTER TEL",
    factoryRegistrationNumber: "FACTORY REG. NO.",
    destinationCountry: "DESTINATION COUNTRY"
  },
  cn: {
    primaryTitle: (data) => data.productNameCn,
    secondaryTitle: (data) => data.productName,
    netWeight: "净含量",
    countryOfOrigin: "原产国",
    ingredients: "配料",
    allergenDeclaration: "过敏原信息",
    productionDateAndLotNumber: "生产日期 / 批号",
    expiryDate: "到期日",
    shelfLife: "保质期",
    storageCondition: "贮存条件",
    manufacturer: "生产商",
    manufacturerAddress: "生产商地址",
    manufacturerTel: "生产商电话",
    importer: "进口商",
    importerAddress: "进口商地址",
    importerTel: "进口商电话",
    factoryRegistrationNumber: "工厂备案号",
    destinationCountry: "目的国"
  }
};

const customRowHeights: Record<CustomRowSize, { minHeight: string; fontSize: string }> = {
  compact: { minHeight: "4.2mm", fontSize: "1.3mm" },
  normal: { minHeight: "5.2mm", fontSize: "1.42mm" },
  tall: { minHeight: "6.6mm", fontSize: "1.34mm" }
};

const pageSizes: Record<TemplateKey, PageSize> = {
  carton_120_square: { width: "120mm", height: "120mm", viewportWidth: 1400, viewportHeight: 1400 },
  carton_120_square_cn: { width: "120mm", height: "120mm", viewportWidth: 1400, viewportHeight: 1400 },
  label_90x120_cn: { width: "92mm", height: "122mm", viewportWidth: 1220, viewportHeight: 1620 },
  label_120x95_cn: { width: "122mm", height: "97mm", viewportWidth: 1620, viewportHeight: 1320 }
};
const a4PdfSheetSizes: Partial<Record<TemplateKey, PdfSheetConfig>> = {
  label_90x120_cn: {
    width: "210mm",
    height: "297mm",
    viewportWidth: 2100,
    viewportHeight: 2970,
    columnGap: "4mm",
    rowGap: "8mm",
    landscape: false
  },
  label_120x95_cn: {
    width: "297mm",
    height: "210mm",
    viewportWidth: 2970,
    viewportHeight: 2100,
    columnGap: "8mm",
    rowGap: "4mm",
    landscape: true
  }
};
const logoAssetConfig: Record<Exclude<LogoKind, "none" | "custom">, { fileName: string; mimeType: string }> = {
  image: { fileName: "商标01.png", mimeType: "image/png" },
  text: { fileName: "商标02.jpg", mimeType: "image/jpeg" }
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function block(text: string, style: string) {
  return `<div style="${style}">${escapeHtml(text)}</div>`;
}

function getLogoDataUri(kind: Exclude<LogoKind, "none" | "custom">) {
  const asset = logoAssetConfig[kind];
  const assetPath = path.join(process.cwd(), "public", asset.fileName);
  const bytes = readFileSync(assetPath);
  return `data:${asset.mimeType};base64,${bytes.toString("base64")}`;
}

function renderLogoMarkup(data: LabelData, templateKey: TemplateKey) {
  if (data.logoKind === "none") {
    return "";
  }

  const box = data.logoBoxes[templateKey];
  const src = data.logoKind === "custom" ? data.customLogoPng : getLogoDataUri(data.logoKind);
  if (!src) {
    return "";
  }

  return `<div style="${mmBoxStyle(
    box,
    "display:flex;align-items:center;justify-content:center;pointer-events:none;"
  )}"><img alt="" src="${src}" style="display:block;width:100%;height:100%;object-fit:contain;" /></div>`;
}

function titleCell(text: string, align = "left") {
  return block(
    text,
    `border:0.35mm solid #111111;padding:0.9mm 1.2mm;box-sizing:border-box;overflow:hidden;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;line-height:1.15;font-size:1.5mm;font-weight:700;text-transform:uppercase;text-align:${align};letter-spacing:0.02em;display:flex;align-items:center;`
  );
}

function valueCell(text: string, fontSize = "1.58mm", weight = 500, extra = "") {
  return block(
    text,
    `border:0.35mm solid #111111;padding:0.9mm 1.2mm;box-sizing:border-box;overflow:hidden;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;line-height:1.15;font-size:${fontSize};font-weight:${weight};${extra}`
  );
}

function detailRow({ label, value, minHeight, fontSize = "1.46mm" }: RowDefinition) {
  return `
    <div style="display:grid;grid-template-columns:29mm 1fr;min-height:${minHeight};">
      ${titleCell(label)}
      ${valueCell(value, fontSize)}
    </div>
  `;
}

function buildRows(data: LabelData, copy: TemplateCopy): RowDefinition[] {
  const hidden = new Set<StandardRowKey>(data.hiddenRows);
  const baseRows: Array<RowDefinition | null> = [
    hidden.has("ingredients")
      ? null
      : { key: "ingredients", label: copy.ingredients, value: data.ingredients, minHeight: "10.6mm", fontSize: "1.2mm" },
    hidden.has("allergenDeclaration")
      ? null
      : { key: "allergenDeclaration", label: copy.allergenDeclaration, value: data.allergenDeclaration, minHeight: "4.4mm", fontSize: "1.34mm" },
    hidden.has("productionDateAndLotNumber")
      ? null
      : { key: "productionDateAndLotNumber", label: copy.productionDateAndLotNumber, value: data.productionDateAndLotNumber, minHeight: "4.3mm" },
    hidden.has("expiryDate") ? null : { key: "expiryDate", label: copy.expiryDate, value: data.expiryDate, minHeight: "4.3mm" },
    hidden.has("shelfLife") ? null : { key: "shelfLife", label: copy.shelfLife, value: data.shelfLife, minHeight: "4.3mm" },
    hidden.has("storageCondition")
      ? null
      : { key: "storageCondition", label: copy.storageCondition, value: data.storageCondition, minHeight: "6mm", fontSize: "1.3mm" },
    hidden.has("manufacturer") ? null : { key: "manufacturer", label: copy.manufacturer, value: data.manufacturer, minHeight: "4.2mm" },
    hidden.has("manufacturerAddress")
      ? null
      : { key: "manufacturerAddress", label: copy.manufacturerAddress, value: data.manufacturerAddress, minHeight: "6mm", fontSize: "1.26mm" },
    hidden.has("manufacturerTel")
      ? null
      : { key: "manufacturerTel", label: copy.manufacturerTel, value: data.manufacturerTel, minHeight: "4.2mm" },
    hidden.has("importer") ? null : { key: "importer", label: copy.importer, value: data.importer, minHeight: "4.2mm" },
    hidden.has("importerAddress")
      ? null
      : { key: "importerAddress", label: copy.importerAddress, value: data.importerAddress, minHeight: "6mm", fontSize: "1.26mm" },
    hidden.has("importerTel") ? null : { key: "importerTel", label: copy.importerTel, value: data.importerTel, minHeight: "4.2mm" }
  ];

  const customRows: RowDefinition[] = data.customRows.map((row: CustomRow) => {
    const size = customRowHeights[row.size];
    return {
      key: row.rowId,
      label: row.label,
      value: row.value,
      minHeight: size.minHeight,
      fontSize: size.fontSize
    };
  });

  return [...baseRows.filter((row): row is RowDefinition => row !== null), ...customRows];
}

function renderCartonLabelMarkup(data: LabelData, templateKey: TemplateKey) {
  const meta = getTemplateMeta(templateKey);
  const copy = copyByVariant[meta.variant];
  const rows = buildRows(data, copy);
  const primaryFontSize = meta.variant === "cn" ? "4.3mm" : "4.6mm";
  const secondaryFontSize = meta.variant === "cn" ? "2.1mm" : "3.6mm";

  return `
    <section data-label-root="true" style="position:relative;width:120mm;height:120mm;box-sizing:border-box;padding:3.2mm;background:#ffffff;color:#111111;font-family:'Arial Narrow','PingFang SC','Microsoft YaHei',Arial,Helvetica,sans-serif;">
      ${renderLogoMarkup(data, templateKey)}
      <div style="width:100%;height:100%;box-sizing:border-box;border:0.8mm solid #111111;padding:1.6mm;display:flex;flex-direction:column;gap:0.45mm;background:#ffffff;">
        <div style="display:grid;grid-template-columns:1fr 24mm;min-height:12.5mm;">
          ${valueCell(copy.primaryTitle(data), primaryFontSize, 700, "display:flex;align-items:center;")}
          ${valueCell(copy.secondaryTitle(data), secondaryFontSize, 700, "display:flex;align-items:center;justify-content:center;text-align:center;")}
        </div>
        <div style="display:grid;grid-template-columns:22mm 21mm 24mm 1fr;min-height:10.8mm;">
          ${titleCell(copy.netWeight)}
          ${valueCell(data.netWeight, "2.15mm", 700, "display:flex;align-items:center;")}
          ${titleCell(copy.countryOfOrigin, "center")}
          ${valueCell(data.countryOfOrigin, "2.25mm", 700, "display:flex;align-items:center;justify-content:center;text-align:center;")}
        </div>
        ${rows.map((row) => detailRow(row)).join("")}
        <div style="display:grid;grid-template-columns:35mm 1fr 24mm 1fr;min-height:5.4mm;">
          ${titleCell(copy.factoryRegistrationNumber)}
          ${valueCell(data.factoryRegistrationNumber, "1.38mm")}
          ${titleCell(copy.destinationCountry)}
          ${valueCell(data.destinationCountry, "1.5mm", 700)}
        </div>
      </div>
    </section>
  `;
}

function mmBoxStyle(box: { x: number; y: number; width: number; height: number }, extra = "") {
  return `position:absolute;left:${box.x}mm;top:${box.y}mm;width:${box.width}mm;height:${box.height}mm;box-sizing:border-box;overflow:hidden;${extra}`;
}

function mainLabelTextStyle(extra = "") {
  return `text-align:center;font-family:'SimHei','黑体','PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif;font-size:${主标签字符高度};font-weight:800;line-height:${主标签字符高度};letter-spacing:0;transform:none;white-space:nowrap;${extra}`;
}

function detailTextStyle(extra = "") {
  return `font-family:'SimHei','黑体','PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif;font-size:${详情字符高度};line-height:${详情字符高度};white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;display:flex;align-items:flex-start;text-align:left;text-align-last:left;${extra}`;
}

function nutritionCellStyle(textAlign: "left" | "center") {
  return `box-sizing:border-box;padding:0;overflow:visible;font-family:'SimHei','黑体','PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif;font-size:${营养表字符高度};font-weight:700;line-height:${营养表字符高度};text-align:${textAlign};white-space:nowrap;`;
}

function nutritionRow(name: string, value: string, nrv: string) {
  return `
    <div style="${nutritionCellStyle("left")}">${escapeHtml(name)}</div>
    <div style="${nutritionCellStyle("center")}">${escapeHtml(value)}</div>
    <div style="${nutritionCellStyle("center")}">${escapeHtml(nrv)}</div>
  `;
}

function nutritionRow120x95(name: string, value: string, nrv: string) {
  return `
    <div style="${nutritionCellStyle("left")}">${escapeHtml(name)}</div>
    <div style="${nutritionCellStyle("center")}">${escapeHtml(value)}</div>
    <div style="${nutritionCellStyle("center")}">${escapeHtml(nrv)}</div>
  `;
}

function nutritionGridStyle() {
  return `display:grid;grid-template-columns:${营养表列模板};column-gap:${营养表列间距};align-items:baseline;min-height:${营养表字符高度};overflow:visible;line-height:${营养表字符高度};`;
}

function nutritionDividerMarkup() {
  return `<div style="grid-column:1 / -1;border-bottom:1px solid #111111;height:0;"></div>`;
}

function nutritionPanelBoxStyle(layout: {
  nutritionTitle: { x: number; y: number; width: number };
  nutritionRemark: { y: number; height: number };
}, frameWidthMm: number) {
  const right = Math.max(1, frameWidthMm - (layout.nutritionTitle.x + layout.nutritionTitle.width));
  return `position:absolute;right:${right}mm;top:${layout.nutritionTitle.y}mm;width:fit-content;min-width:max-content;max-width:calc(${frameWidthMm}mm - ${right}mm - 2mm);height:auto;box-sizing:border-box;overflow:visible;background:#ffffff;pointer-events:none;`;
}

function renderNutritionTable90(data: LabelData, layout: ReturnType<typeof normalizeLabel90NutritionLayout>) {
  return `
    <div style="${nutritionPanelBoxStyle(layout, 90)}">
      <div style="width:fit-content;min-width:max-content;max-width:100%;border:1px solid #111111;box-sizing:border-box;overflow:visible;background:#ffffff;">
        <div style="border-bottom:1px solid #111111;box-sizing:border-box;padding:0 0.6mm;text-align:center;font-family:'SimHei','黑体','PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif;font-size:${营养表字符高度};font-weight:800;line-height:${营养表字符高度};white-space:nowrap;">营养成分表</div>
        <div style="${nutritionGridStyle()}">
          <div style="${nutritionCellStyle("left")}">项目</div>
          <div style="${nutritionCellStyle("center")}">${escapeHtml(data.nutritionServingSize || "每100克")}</div>
          <div style="${nutritionCellStyle("center")}">营养素参考值%</div>
          ${nutritionDividerMarkup()}
          ${nutritionRow("能量", data.nutritionEnergy, data.nutritionEnergyNrv)}
          ${nutritionRow("蛋白质", data.nutritionProtein, data.nutritionProteinNrv)}
          ${nutritionRow("脂肪", data.nutritionFat, data.nutritionFatNrv)}
          ${nutritionRow("-饱和脂肪", data.nutritionSaturatedFat, data.nutritionSaturatedFatNrv)}
          ${nutritionRow("碳水化合物", data.nutritionCarbohydrate, data.nutritionCarbohydrateNrv)}
          ${nutritionRow("-糖", data.nutritionSugar, data.nutritionSugarNrv)}
          ${nutritionRow("钠", data.nutritionSodium, data.nutritionSodiumNrv)}
        </div>
        <div style="border-top:1px solid #111111;box-sizing:border-box;padding:0 0.6mm;text-align:center;font-family:'SimHei','黑体','PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif;font-size:${营养表字符高度};font-weight:700;line-height:${营养表字符高度};white-space:nowrap;">${escapeHtml(data.nutritionRemark || "儿童青少年应避免过量摄入盐油糖")}</div>
      </div>
    </div>
  `;
}

function renderNutritionTable120x95(data: LabelData, layout: ReturnType<typeof normalizeLabel120x95NutritionLayout>) {
  return `
    <div style="${nutritionPanelBoxStyle(layout, 120)}">
      <div style="width:fit-content;min-width:max-content;max-width:100%;border:1px solid #111111;box-sizing:border-box;overflow:visible;background:#ffffff;">
        <div style="border-bottom:1px solid #111111;box-sizing:border-box;padding:0 0.6mm;text-align:center;font-family:'SimHei','黑体','PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif;font-size:${营养表字符高度};font-weight:800;line-height:${营养表字符高度};white-space:nowrap;">营养成分表</div>
        <div style="${nutritionGridStyle()}">
          <div style="${nutritionCellStyle("left")}">项目</div>
          <div style="${nutritionCellStyle("center")}">${escapeHtml(data.nutritionServingSize || "每100克")}</div>
          <div style="${nutritionCellStyle("center")}">营养素参考值%</div>
          ${nutritionDividerMarkup()}
          ${nutritionRow120x95("能量", data.nutritionEnergy, data.nutritionEnergyNrv)}
          ${nutritionRow120x95("蛋白质", data.nutritionProtein, data.nutritionProteinNrv)}
          ${nutritionRow120x95("脂肪", data.nutritionFat, data.nutritionFatNrv)}
          ${nutritionRow120x95("-饱和脂肪", data.nutritionSaturatedFat, data.nutritionSaturatedFatNrv)}
          ${nutritionRow120x95("碳水化合物", data.nutritionCarbohydrate, data.nutritionCarbohydrateNrv)}
          ${nutritionRow120x95("-糖", data.nutritionSugar, data.nutritionSugarNrv)}
          ${nutritionRow120x95("钠", data.nutritionSodium, data.nutritionSodiumNrv)}
        </div>
        <div style="border-top:1px solid #111111;box-sizing:border-box;padding:0 0.6mm;text-align:center;font-family:'SimHei','黑体','PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif;font-size:${营养表字符高度};font-weight:700;line-height:${营养表字符高度};white-space:nowrap;">${escapeHtml(data.nutritionRemark || "儿童青少年应避免过量摄入盐油糖")}</div>
      </div>
    </div>
  `;
}

function normalizeLabel90NutritionLayout(data: LabelData) {
  return data.label90Layout;
}

function normalizeLabel120x95NutritionLayout(data: LabelData) {
  return data.label12095Layout;
}

const label90DetailLabels = {
  formalName: "产品名称：",
  ingredients: "配料表：",
  allergen: "致敏物质提示：",
  license: "食品生产许可证编号：",
  storage: "贮存条件：",
  date: "生产日期及保质期到期日：",
  consignor: "委托商：",
  consignorAddress: "委托商地址：",
  consignorTel: "委托商电话：",
  manufacturer: "受委托商：",
  manufacturerAddress: "地址：",
  manufacturerTel: "电话：",
  countryOfOrigin: "产地：",
  standardCode: "产品执行标准：",
  usageMethod: "食用方法：",
  shelfLife: "保质期："
} as const;

type Label90DetailKey = keyof typeof label90DetailLabels | "customRows";

function isLabel90DetailHidden(data: LabelData, key: Label90DetailKey) {
  return data.label90HiddenDetails.includes(key);
}

function label90DetailValue(data: LabelData, key: Label90DetailKey) {
  switch (key) {
    case "formalName":
      return data.productFormalNameCn || data.productNameCn;
    case "ingredients":
      return data.ingredients;
    case "allergen":
      return data.allergenDeclaration;
    case "license":
      return data.productionLicenseNumber;
    case "storage":
      return data.storageCondition;
    case "date":
      return data.productionDateAndLotNumber || data.expiryDate;
    case "consignor":
      return data.consignor;
    case "consignorAddress":
      return data.consignorAddress;
    case "consignorTel":
      return data.consignorTel;
    case "manufacturer":
      return data.manufacturer;
    case "manufacturerAddress":
      return data.manufacturerAddress;
    case "manufacturerTel":
      return data.manufacturerTel;
    case "countryOfOrigin":
      return data.countryOfOrigin;
    case "standardCode":
      return data.productStandardCode;
    case "usageMethod":
      return data.usageMethod;
    case "shelfLife":
      return data.shelfLife;
    case "customRows":
      return data.customRows.map((row) => `${row.label}：${row.value}`).join("\n");
  }
}

function renderLabel90DetailBox(data: LabelData, key: Label90DetailKey) {
  if (isLabel90DetailHidden(data, key)) {
    return "";
  }

  const value = label90DetailValue(data, key).trim();
  if (!value && key !== "manufacturerTel") {
    return "";
  }

  const box = {
    ...data.label90DetailBoxes[key],
    x: key === "customRows" ? data.label90DetailBoxes[key].x : label90DetailFixedLeftMm
  };
  const content =
    key === "customRows"
      ? escapeHtml(value)
      : `<span style="font-weight:800;">${escapeHtml(label90DetailLabels[key as Exclude<Label90DetailKey, "customRows">])}</span>${escapeHtml(value)}`;

  return `<div style="${mmBoxStyle(
    box,
    detailTextStyle(key === "manufacturerTel" ? "z-index:2;" : "z-index:1;")
  )}"><span style="display:block;width:100%;text-align:left;text-align-last:left;">${content}</span></div>`;
}

function renderLabel90Markup(data: LabelData) {
  const layout = normalizeLabel90NutritionLayout(data);
  const detailMarkup = (
    [
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
    ] as Label90DetailKey[]
  )
    .map((key) => renderLabel90DetailBox(data, key))
    .join("");

  return `
    <section data-label-root="true" style="width:92mm;height:122mm;box-sizing:border-box;padding:1mm;background:#ffffff;color:#231f20;font-family:'SimHei','黑体','PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif;">
      <div style="position:relative;width:90mm;height:120mm;box-sizing:border-box;border:0.32mm solid #111111;background:#ffffff;overflow:hidden;">
        ${renderLogoMarkup(data, "label_90x120_cn")}
        <div style="${mmBoxStyle(layout.title, `text-align:center;font-size:${layout.title.fontSize}pt;line-height:1.06;letter-spacing:0.04mm;font-weight:800;`)}">${escapeHtml(data.productNameCn)}</div>
        <div style="${mmBoxStyle(layout.category, mainLabelTextStyle())}">${escapeHtml(data.productCategoryCn || "复合调味料")}</div>
        <div style="${mmBoxStyle(layout.netWeight, mainLabelTextStyle())}">净含量：${escapeHtml(data.netWeight)}</div>
        ${detailMarkup}
        ${data.label90NutritionHidden ? "" : renderNutritionTable90(data, layout)}
      </div>
    </section>
  `;
}

function renderLabel120x95DetailBox(data: LabelData, key: Label12095DetailKey) {
  if (data.label12095HiddenDetails.includes(key)) {
    return "";
  }

  const value = renderLabel12095DetailValue(data, key).trim();
  const box = {
    ...data.label12095DetailBoxes[key],
    x: label12095DetailFixedLeftMm
  };

  return `<div style="${mmBoxStyle(
    box,
    detailTextStyle()
  )}"><span style="display:block;width:100%;text-align:left;text-align-last:left;"><span style="font-weight:800;">${escapeHtml(label12095DetailLabels[key])}</span>${escapeHtml(value)}</span></div>`;
}

function renderLabel120x95Markup(data: LabelData) {
  const layout = normalizeLabel120x95NutritionLayout(data);
  const detailMarkup = label12095DetailOrder.map((key) => renderLabel120x95DetailBox(data, key)).join("");

  return `
    <section data-label-root="true" style="width:122mm;height:97mm;box-sizing:border-box;padding:1mm;background:#ffffff;color:#231f20;font-family:'SimHei','黑体','PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif;">
      <div style="position:relative;width:120mm;height:95mm;box-sizing:border-box;border:0.32mm solid #111111;background:#ffffff;overflow:hidden;">
        ${renderLogoMarkup(data, "label_120x95_cn")}
        <div style="${mmBoxStyle(layout.title, `text-align:center;font-size:${layout.title.fontSize}pt;font-weight:800;line-height:1.02;letter-spacing:0.03mm;`)}">${escapeHtml(data.productNameCn)}</div>
        <div style="${mmBoxStyle(layout.category, mainLabelTextStyle())}">${escapeHtml(data.productCategoryCn || data.productFormalNameCn || "复合调味料")}</div>
        ${detailMarkup}

        ${
          data.label90NutritionHidden
            ? ""
            : renderNutritionTable120x95(data, layout)
        }

        <div style="${mmBoxStyle(layout.netWeight, mainLabelTextStyle())}">净含量：${escapeHtml(data.netWeight)}</div>
      </div>
    </section>
  `;
}

function renderMarkup(data: LabelData, templateKey: TemplateKey) {
  if (templateKey === "label_90x120_cn") {
    return renderLabel90Markup(data);
  }

  if (templateKey === "label_120x95_cn") {
    return renderLabel120x95Markup(data);
  }

  return renderCartonLabelMarkup(data, templateKey);
}

function getExportData(templateKey: TemplateKey, data: unknown): LabelData {
  if (templateKey === "label_90x120_cn" || templateKey === "label_120x95_cn") {
    return createExportLabelData(data);
  }

  return labelSchema.parse(data);
}

function renderLabelHtml(payload: ExportPayload): string {
  const templateKey = templateKeySchema.parse(payload.templateKey);
  const data = getExportData(templateKey, payload.data);
  const markup = renderMarkup(data, templateKey);
  const pageSize = pageSizes[templateKey];

  return renderHtmlDocument(markup, pageSize);
}

function renderPdfHtml(payload: ExportPayload): string {
  const templateKey = templateKeySchema.parse(payload.templateKey);
  const data = getExportData(templateKey, payload.data);
  const sheetSize = a4PdfSheetSizes[templateKey];

  if (!sheetSize) {
    return renderLabelHtml(payload);
  }

  const labels = Array.from({ length: 4 }, () => renderMarkup(data, templateKey)).join("");
  return renderPdfHtmlDocument(labels, sheetSize);
}

function renderHtmlDocument(markup: string, pageSize: PageSize): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Label Export</title>
    <style>
      @page { size: ${pageSize.width} ${pageSize.height}; margin: 0; }
      html, body {
        margin: 0;
        padding: 0;
        width: ${pageSize.width};
        height: ${pageSize.height};
        background: #ffffff;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    </style>
  </head>
  <body>${markup}</body>
</html>`;
}

function renderPdfHtmlDocument(markup: string, pageSize: PdfSheetConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Label PDF Export</title>
    <style>
      @page { size: A4 ${pageSize.landscape ? "landscape" : "portrait"}; margin: 0; }
      html, body {
        margin: 0;
        padding: 0;
        width: ${pageSize.width};
        height: ${pageSize.height};
        background: #ffffff;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .pdf-page {
        width: ${pageSize.width};
        height: ${pageSize.height};
        box-sizing: border-box;
        display: grid;
        grid-template-columns: repeat(2, max-content);
        grid-template-rows: repeat(2, max-content);
        justify-content: center;
        align-content: center;
        column-gap: ${pageSize.columnGap};
        row-gap: ${pageSize.rowGap};
        page-break-after: always;
        break-after: page;
        overflow: hidden;
        background: #ffffff;
      }
      .pdf-page > [data-label-root='true'] {
        margin: 0;
        transform: none;
      }
    </style>
  </head>
  <body><main class="pdf-page">${markup}</main></body>
</html>`;
}

async function withPage<T>(
  payload: ExportPayload,
  run: (page: Page, pageSize: PageSize) => Promise<T>,
  options?: { pageSize?: PageSize; html?: string }
) {
  let browser: Browser | null = null;

  try {
    browser = await launchBrowser();
    const templateKey = templateKeySchema.parse(payload.templateKey);
    const pageSize = options?.pageSize ?? pageSizes[templateKey];
    const page = await browserPage(browser, pageSize);
    await page.setContent(options?.html ?? renderLabelHtml(payload), { waitUntil: "load" });
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts?.ready);
    return await run(page, pageSize);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message.includes("Executable doesn't exist")) {
      throw new AppError(
        "PLAYWRIGHT_BROWSER_MISSING",
        "未找到可用的浏览器。请安装 Google Chrome / Microsoft Edge，或执行 `npx playwright install chromium`。",
        500
      );
    }

    if (message.toLowerCase().includes("browser") || message.toLowerCase().includes("playwright")) {
      throw new AppError("PLAYWRIGHT_RENDER_FAILED", `导出引擎启动失败：${message}`, 500);
    }

    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("Executable doesn't exist")) {
      throw error;
    }
  }

  for (const channel of ["chrome", "msedge"] as const) {
    try {
      return await chromium.launch({ channel, headless: true });
    } catch {
      continue;
    }
  }

  throw new AppError(
    "PLAYWRIGHT_BROWSER_MISSING",
    "未找到可用的浏览器。请安装 Google Chrome / Microsoft Edge，或执行 `npx playwright install chromium`。",
    500
  );
}

async function browserPage(browser: Browser, pageSize: PageSize): Promise<Page> {
  return browser.newPage({
    viewport: {
      width: pageSize.viewportWidth,
      height: pageSize.viewportHeight
    },
    deviceScaleFactor: 2
  });
}

export async function exportPdf(payload: ExportPayload): Promise<Buffer> {
  const templateKey = templateKeySchema.parse(payload.templateKey);
  const sheetSize = a4PdfSheetSizes[templateKey];

  return withPage(
    payload,
    async (page) =>
      Buffer.from(
        await page.pdf({
          format: sheetSize ? "A4" : undefined,
          landscape: sheetSize?.landscape,
          width: sheetSize ? undefined : pageSizes[templateKey].width,
          height: sheetSize ? undefined : pageSizes[templateKey].height,
          printBackground: true,
          preferCSSPageSize: Boolean(sheetSize),
          margin: {
            top: "0mm",
            right: "0mm",
            bottom: "0mm",
            left: "0mm"
          }
        })
      ),
    sheetSize
      ? {
          pageSize: {
            width: sheetSize.width,
            height: sheetSize.height,
            viewportWidth: sheetSize.viewportWidth,
            viewportHeight: sheetSize.viewportHeight
          },
          html: renderPdfHtml(payload)
        }
      : undefined
  );
}

export async function exportPng(payload: ExportPayload): Promise<Buffer> {
  return withPage(payload, async (page) =>
    Buffer.from(
      await page.locator("[data-label-root='true']").screenshot({
        type: "png"
      })
    )
  );
}
