import type { CSSProperties } from "react";

import { 商标渲染01 } from "@/components/商标渲染01";
import type { CustomRow, CustomRowSize, LabelData, StandardRowKey } from "@/lib/labelSchema";
import { getTemplateMeta, type TemplateKey } from "@/lib/templateCatalog";

type RowDefinition = {
  key: string;
  label: string;
  value: string;
  minHeight: string;
  fontSize?: string;
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

const outerStyle: CSSProperties = {
  position: "relative",
  width: "120mm",
  height: "120mm",
  boxSizing: "border-box",
  padding: "3.2mm",
  background: "#ffffff",
  color: "#111111",
  fontFamily: '"Arial Narrow", "PingFang SC", "Microsoft YaHei", Arial, Helvetica, sans-serif'
};

const frameStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
  border: "0.8mm solid #111111",
  padding: "1.6mm",
  display: "flex",
  flexDirection: "column",
  gap: "0.45mm",
  background: "#ffffff"
};

const cellBase: CSSProperties = {
  border: "0.35mm solid #111111",
  padding: "0.9mm 1.2mm",
  boxSizing: "border-box",
  overflow: "hidden",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  overflowWrap: "anywhere",
  lineHeight: 1.15
};

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

function titleCell(text: string, align: CSSProperties["textAlign"] = "left") {
  return (
    <div
      style={{
        ...cellBase,
        fontSize: "1.5mm",
        fontWeight: 700,
        textTransform: "uppercase",
        textAlign: align,
        letterSpacing: "0.02em",
        display: "flex",
        alignItems: "center"
      }}
    >
      {text}
    </div>
  );
}

function valueCell(text: string, fontSize = "1.58mm", weight = 500, extra?: CSSProperties) {
  return (
    <div
      style={{
        ...cellBase,
        fontSize,
        fontWeight: weight,
        ...extra
      }}
    >
      {text}
    </div>
  );
}

function detailRow({ label, value, minHeight, fontSize = "1.46mm" }: RowDefinition) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "29mm 1fr", minHeight }}>
      {titleCell(label)}
      {valueCell(value, fontSize)}
    </div>
  );
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

export function CartonLabel120({ data, templateKey }: { data: LabelData; templateKey: TemplateKey }) {
  const meta = getTemplateMeta(templateKey);
  const copy = copyByVariant[meta.variant];
  const rows = buildRows(data, copy);
  const primaryFontSize = meta.variant === "cn" ? "4.3mm" : "4.6mm";
  const secondaryFontSize = meta.variant === "cn" ? "2.1mm" : "3.6mm";

  return (
    <section data-label-root="true" style={outerStyle}>
      <商标渲染01 data={data} templateKey={templateKey} />
      <div style={frameStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 24mm", minHeight: "12.5mm" }}>
          {valueCell(copy.primaryTitle(data), primaryFontSize, 700, { display: "flex", alignItems: "center" })}
          {valueCell(copy.secondaryTitle(data), secondaryFontSize, 700, {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center"
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "22mm 21mm 24mm 1fr", minHeight: "10.8mm" }}>
          {titleCell(copy.netWeight)}
          {valueCell(data.netWeight, "2.15mm", 700, { display: "flex", alignItems: "center" })}
          {titleCell(copy.countryOfOrigin, "center")}
          {valueCell(data.countryOfOrigin, "2.25mm", 700, { display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" })}
        </div>

        {rows.map((row) => (
          <div key={row.key}>{detailRow(row)}</div>
        ))}

        <div style={{ display: "grid", gridTemplateColumns: "35mm 1fr 24mm 1fr", minHeight: "5.4mm" }}>
          {titleCell(copy.factoryRegistrationNumber)}
          {valueCell(data.factoryRegistrationNumber, "1.38mm")}
          {titleCell(copy.destinationCountry)}
          {valueCell(data.destinationCountry, "1.5mm", 700)}
        </div>
      </div>
    </section>
  );
}
