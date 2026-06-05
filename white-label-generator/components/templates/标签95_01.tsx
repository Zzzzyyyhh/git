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

const 主标签字符高度 = "8.5mm";
const 详情字符高度 = "3.5mm";
const 营养表字符高度 = "3.5mm";
const 营养表列模板 = "max-content max-content max-content";
const 营养表列间距 = "1mm";

const outerStyle: CSSProperties = {
  width: "122mm",
  height: "97mm",
  boxSizing: "border-box",
  padding: "1mm",
  background: "#ffffff",
  color: "#231f20",
  fontFamily: '"SimHei", "黑体", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif'
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

function nutritionRow(name: string, value: string, nrv: string) {
  return (
    <>
      <div style={nutritionCellStyle("left")}>{name}</div>
      <div style={nutritionCellStyle("center")}>{value}</div>
      <div style={nutritionCellStyle("center")}>{nrv}</div>
    </>
  );
}

function nutritionCellStyle(textAlign: CSSProperties["textAlign"]): CSSProperties {
  return {
    boxSizing: "border-box",
    padding: 0,
    overflow: "visible",
    fontFamily: '"SimHei", "黑体", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
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
  const top = layout.nutritionTitle.y;
  const right = Math.max(1, 120 - (layout.nutritionTitle.x + layout.nutritionTitle.width));

  return {
    position: "absolute",
    right: `${right}mm`,
    top: `${top}mm`,
    width: "fit-content",
    minWidth: "max-content",
    maxWidth: `calc(120mm - ${right}mm - 2mm)`,
    boxSizing: "border-box",
    overflow: "visible",
    background: "#ffffff",
    pointerEvents: "auto"
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
    padding: "0 0.6mm",
    textAlign: "center",
    fontFamily: '"SimHei", "黑体", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
    fontSize: 营养表字符高度,
    fontWeight: 800,
    lineHeight: 营养表字符高度,
    whiteSpace: "nowrap"
  };
}

function mainLabelTextStyle(extra?: CSSProperties): CSSProperties {
  return {
    textAlign: "center",
    fontFamily: '"SimHei", "黑体", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
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
    fontFamily: '"SimHei", "黑体", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
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
      <span style={{ display: "block", width: "100%", textAlign: "left", textAlignLast: "left" }}>
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
          {data.productCategoryCn || data.productFormalNameCn || "复合调味料"}
        </div>

        {label12095DetailOrder.map((detailKey) => (
          <DetailTextBox data={data} detailKey={detailKey} key={detailKey} />
        ))}

        {!data.label90NutritionHidden ? (
          <div data-editable-id="nutrition:nutritionPanel" style={nutritionPanelStyle(layout)}>
            <div style={nutritionBoxStyle()}>
              <div style={nutritionTitleStyle(layout)}>营养成分表</div>
              <div style={nutritionGridStyle()}>
                <div style={nutritionCellStyle("left")}>项目</div>
                <div style={nutritionCellStyle("center")}>{data.nutritionServingSize || "每100克"}</div>
                <div style={nutritionCellStyle("center")}>营养素参考值%</div>
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
                  padding: "0 0.6mm",
                  textAlign: "center",
                  fontFamily: '"SimHei", "黑体", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
                  fontSize: 营养表字符高度,
                  fontWeight: 700,
                  lineHeight: 营养表字符高度,
                  whiteSpace: "nowrap"
                }}
              >
                {data.nutritionRemark || "儿童青少年应避免过量摄入盐油糖"}
              </div>
            </div>
          </div>
        ) : null}

        <div
          data-editable-id="layout:netWeight"
          style={mmBox(layout.netWeight, mainLabelTextStyle())}
        >
          净含量：{data.netWeight}
        </div>
      </div>
    </section>
  );
}
