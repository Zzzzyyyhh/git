"use client";

import type { CSSProperties } from "react";

import { 商标渲染01 } from "@/components/商标渲染01";
import { label90DetailFixedLeftMm, type Label90DetailKey, type Label90Layout, type LabelData } from "@/lib/labelSchema";
import type { TemplateKey } from "@/lib/templateCatalog";

const 主标签字符高度 = "7mm";
const 详情字符高度 = "2.5mm";
const 营养表字符高度 = "2.5mm";
const 营养表列模板 = "max-content max-content max-content";
const 营养表列间距 = "1mm";
const 思源黑体 = '"Source Han Sans CN", "思源黑体", "Source Han Sans SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';

const outerStyle: CSSProperties = {
  width: "92mm",
  height: "122mm",
  boxSizing: "border-box",
  padding: "1mm",
  background: "#ffffff",
  color: "#231f20",
  fontFamily: 思源黑体
};

const frameStyle: CSSProperties = {
  position: "relative",
  width: "90mm",
  height: "120mm",
  boxSizing: "border-box",
  border: "0.32mm solid #111111",
  background: "#ffffff",
  overflow: "hidden"
};

const detailLabels: Record<Exclude<Label90DetailKey, "customRows">, string> = {
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
};

function mmBox(box: { x: number; y: number; width: number; height: number }, extra?: CSSProperties): CSSProperties {
  return {
    position: "absolute",
    left: `${box.x}mm`,
    top: `${box.y}mm`,
    width: `${box.width}mm`,
    height: `${box.height}mm`,
    boxSizing: "border-box",
    overflow: "hidden",
    ...extra
  };
}

function renderDetailValue(data: LabelData, key: Label90DetailKey) {
  switch (key) {
    case "formalName":
      return data.productFormalNameCn;
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

function isHidden(data: LabelData, key: Label90DetailKey) {
  return data.label90HiddenDetails.includes(key);
}

const 长体: CSSProperties = { display: "inline-block", transform: "scaleY(1.136)", transformOrigin: "center bottom" };

function nutritionRow(name: string, value: string, nrv: string) {
  return (
    <>
      <div style={nutritionCellStyle("left")}><span style={长体}>{name}</span></div>
      <div style={nutritionCellStyle("center")}><span style={长体}>{value}</span></div>
      <div style={nutritionCellStyle("center")}><span style={长体}>{nrv}</span></div>
    </>
  );
}

function nutritionCellStyle(textAlign: CSSProperties["textAlign"]): CSSProperties {
  return {
    boxSizing: "border-box",
    padding: "0 1.5mm",
    overflow: "visible",
    fontFamily: 思源黑体,
    fontSize: 营养表字符高度,
    fontWeight: 700,
    lineHeight: 营养表字符高度,
    textAlign,
    whiteSpace: "nowrap"
  };
}

function nutritionGridStyle(): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: 营养表列模板,
    columnGap: 营养表列间距,
    rowGap: "0.4mm",
    padding: "0.4mm 0",
    alignItems: "baseline",
    minHeight: 营养表字符高度,
    overflow: "visible",
    lineHeight: 营养表字符高度
  };
}

function nutritionDividerStyle(): CSSProperties {
  return {
    gridColumn: "1 / -1",
    borderBottom: "1px solid #111111",
    height: 0
  };
}

function nutritionPanelStyle(layout: Label90Layout): CSSProperties {
  return {
    position: "absolute",
    left: `${layout.nutritionTitle.x}mm`,
    top: `${layout.nutritionTitle.y}mm`,
    width: "fit-content",
    minWidth: "max-content",
    maxWidth: `calc(90mm - ${layout.nutritionTitle.x}mm - 2mm)`,
    boxSizing: "border-box",
    overflow: "visible",
    background: "#ffffff",
    pointerEvents: "auto",
    zIndex: 3
  };
}

function nutritionBoxStyle(): CSSProperties {
  return {
    width: "fit-content",
    minWidth: "max-content",
    maxWidth: "100%",
    border: "1px solid #111111",
    boxSizing: "border-box",
    overflow: "visible",
    background: "#ffffff"
  };
}

function nutritionTitleStyle(layout: Label90Layout): CSSProperties {
  return {
    borderBottom: "1px solid #111111",
    boxSizing: "border-box",
    padding: "0.3mm 0.6mm",
    textAlign: "center",
    fontFamily: 思源黑体,
    fontSize: 营养表字符高度,
    fontWeight: 800,
    lineHeight: 营养表字符高度,
    whiteSpace: "nowrap"
  };
}

function mainLabelTextStyle(extra?: CSSProperties): CSSProperties {
  return {
    textAlign: "center",
    fontFamily: 思源黑体,
    fontSize: 主标签字符高度,
    fontWeight: 800,
    lineHeight: 主标签字符高度,
    letterSpacing: "0",
    transform: "none",
    whiteSpace: "nowrap",
    ...extra
  };
}

function detailTextStyle(extra?: CSSProperties): CSSProperties {
  return {
    fontFamily: 思源黑体,
    fontSize: 详情字符高度,
    lineHeight: 详情字符高度,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    display: "flex",
    alignItems: "flex-start",
    textAlign: "left",
    textAlignLast: "left",
    ...extra
  };
}

function normalizeNutritionLayout(layout: Label90Layout): Label90Layout {
  return layout;
}

function DetailTextBox({ data, detailKey }: { data: LabelData; detailKey: Label90DetailKey }) {
  if (isHidden(data, detailKey)) {
    return null;
  }

  const box = {
    ...data.label90DetailBoxes[detailKey],
    x: detailKey === "customRows" ? data.label90DetailBoxes[detailKey].x : label90DetailFixedLeftMm
  };
  const value = renderDetailValue(data, detailKey).trim();

  if (!value && detailKey !== "manufacturerTel") {
    return null;
  }

  return (
    <div
      data-editable-id={`detail:${detailKey}`}
      style={{
        position: "absolute",
        left: `${box.x}mm`,
        top: `${box.y}mm`,
        width: `${box.width}mm`,
        minHeight: `${box.height}mm`,
        height: "auto",
        boxSizing: "border-box",
        overflow: "visible",
        ...detailTextStyle({ zIndex: detailKey === "manufacturerTel" ? 2 : 1 })
      }}
    >
      {detailKey === "customRows" ? (
        value
      ) : (
        <span style={{ display: "block", width: "100%", textAlign: "justify", transform: "scaleY(1.136)", transformOrigin: "left top" }}>
          <span style={{ fontWeight: 800 }}>{detailLabels[detailKey as Exclude<Label90DetailKey, "customRows">]}</span>
          {value}
        </span>
      )}
    </div>
  );
}

export function 标签90({ data, templateKey }: { data: LabelData; templateKey: TemplateKey }) {
  const layout = normalizeNutritionLayout(data.label90Layout);
  const detailKeys = data.label90DetailOrder;

  return (
    <section data-label-root="true" style={outerStyle}>
      <div data-label-frame="true" style={frameStyle}>
        <商标渲染01 data={data} templateKey={templateKey} />
        <div
          data-editable-id="layout:title"
          style={mmBox(layout.title, {
            textAlign: "center",
            fontSize: `${layout.title.fontSize}pt`,
            lineHeight: 1.06,
            letterSpacing: "0.04mm",
            fontWeight: 800
          })}
        >
          {data.productNameCn}
        </div>

        <div
          data-editable-id="layout:category"
          style={mmBox(layout.category, mainLabelTextStyle())}
        >
          <span style={{ display: "block", transform: "scaleY(1.136)", transformOrigin: "center top" }}>
            {data.productCategoryCn || "复合调味料"}
          </span>
        </div>

        <div
          data-editable-id="layout:netWeight"
          style={mmBox(layout.netWeight, mainLabelTextStyle({ fontFamily: 思源黑体 }))}
        >
          <span style={{ display: "block", transform: "scaleY(1.136)", transformOrigin: "center top" }}>
            净含量：{data.netWeight}
          </span>
        </div>

        {detailKeys.map((detailKey) => (
          <DetailTextBox data={data} detailKey={detailKey} key={detailKey} />
        ))}

        {!data.label90NutritionHidden ? (
          <div
            data-editable-id="nutrition:nutritionPanel"
            style={nutritionPanelStyle(layout)}
          >
            <div style={nutritionBoxStyle()}>
              <div style={nutritionTitleStyle(layout)}><span style={长体}>营养成分表</span></div>
              <div style={nutritionGridStyle()}>
                <div style={nutritionCellStyle("left")}><span style={长体}>项目</span></div>
                <div style={nutritionCellStyle("center")}><span style={长体}>{data.nutritionServingSize || "每100克"}</span></div>
                <div style={nutritionCellStyle("center")}><span style={长体}>营养素参考值%</span></div>
                <div style={nutritionDividerStyle()} />
                {nutritionRow("能量", data.nutritionEnergy, data.nutritionEnergyNrv)}
                {nutritionRow("蛋白质", data.nutritionProtein, data.nutritionProteinNrv)}
                {nutritionRow("脂肪", data.nutritionFat, data.nutritionFatNrv)}
                {nutritionRow("-饱和脂肪", data.nutritionSaturatedFat, data.nutritionSaturatedFatNrv)}
                {nutritionRow("碳水化合物", data.nutritionCarbohydrate, data.nutritionCarbohydrateNrv)}
                {nutritionRow("-糖", data.nutritionSugar, data.nutritionSugarNrv)}
                {nutritionRow("钠", data.nutritionSodium, data.nutritionSodiumNrv)}
              </div>
              <div
                style={{
                  borderTop: "1px solid #111111",
                  boxSizing: "border-box",
                  padding: "0.4mm 0.6mm",
                  textAlign: "center",
                  fontFamily: 思源黑体,
                  fontSize: 营养表字符高度,
                  fontWeight: 700,
                  lineHeight: 营养表字符高度,
                  whiteSpace: "nowrap"
                }}
              >
                <span style={长体}>{data.nutritionRemark || "儿童青少年应避免过量摄入盐油糖"}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
