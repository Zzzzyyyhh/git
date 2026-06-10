"use client";

import type { CSSProperties } from "react";

import { 商标渲染01 } from "@/components/商标渲染01";
import {
  label12095DetailFixedLeftMm,
  type Label12095DetailKey,
  type Label12095Layout,
  type LabelData
} from "@/lib/labelSchema";
import type { TemplateKey } from "@/lib/templateCatalog";
import { label12095DetailLabels, label12095DetailOrder, renderLabel12095DetailValue } from "@/lib/中文模板120_01";

const 主标签字符高度 = "7mm";
const 详情字符高度 = "2.5mm";
const 营养表字符高度 = "2.5mm";
const 营养表列模板 = "max-content max-content max-content";
const 营养表列间距 = "1mm";
const 思源黑体 = '"Source Han Sans CN", "思源黑体", "Source Han Sans SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';

const outerStyle: CSSProperties = {
  width: "122mm",
  height: "97mm",
  boxSizing: "border-box",
  padding: "1mm",
  background: "#ffffff",
  color: "#231f20",
  fontFamily: 思源黑体
};

const frameStyle: CSSProperties = {
  position: "relative",
  width: "120mm",
  height: "95mm",
  boxSizing: "border-box",
  border: "0.32mm solid #111111",
  background: "#ffffff",
  overflow: "hidden"
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

function nutritionPanelStyle(layout: Label12095Layout): CSSProperties {
  return {
    position: "absolute",
    left: `${layout.nutritionTitle.x}mm`,
    top: `${layout.nutritionTitle.y}mm`,
    width: "fit-content",
    minWidth: "max-content",
    maxWidth: `calc(120mm - ${layout.nutritionTitle.x}mm - 2mm)`,
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

function nutritionTitleStyle(layout: Label12095Layout): CSSProperties {
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

function normalizeNutritionLayout(layout: Label12095Layout): Label12095Layout {
  return layout;
}

function DetailTextBox({ data, detailKey }: { data: LabelData; detailKey: Label12095DetailKey }) {
  if (data.label12095HiddenDetails.includes(detailKey)) {
    return null;
  }

  const box = {
    ...data.label12095DetailBoxes[detailKey],
    x: label12095DetailFixedLeftMm
  };
  const value = renderLabel12095DetailValue(data, detailKey).trim();

  return (
    <div
      data-editable-id={`detail:${detailKey}`}
      style={mmBox(box, detailTextStyle())}
    >
      <span style={{ display: "block", width: "100%", textAlign: "justify", transform: "scaleY(1.136)", transformOrigin: "left top" }}>
        <span style={{ fontWeight: 800 }}>{label12095DetailLabels[detailKey]}</span>
        {value}
      </span>
    </div>
  );
}

export function 标签95_01({ data, templateKey }: { data: LabelData; templateKey: TemplateKey }) {
  const layout = normalizeNutritionLayout(data.label12095Layout);

  return (
    <section data-label-root="true" style={outerStyle}>
      <div data-label-frame="true" style={frameStyle}>
        <商标渲染01 data={data} templateKey={templateKey} />

        <div
          data-editable-id="layout:title"
          style={mmBox(layout.title, {
            textAlign: "center",
            fontSize: `${layout.title.fontSize}pt`,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: "0.03mm"
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

        {label12095DetailOrder.map((detailKey) => (
          <DetailTextBox data={data} detailKey={detailKey} key={detailKey} />
        ))}

        {!data.label90NutritionHidden ? (
          <div data-editable-id="nutrition:nutritionPanel" style={nutritionPanelStyle(layout)}>
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

        <div
          data-editable-id="layout:netWeight"
          style={mmBox(layout.netWeight, mainLabelTextStyle({ fontFamily: 思源黑体 }))}
        >
          <span style={{ display: "block", transform: "scaleY(1.136)", transformOrigin: "center top" }}>
            净含量：{data.netWeight}
          </span>
        </div>
      </div>
    </section>
  );
}
