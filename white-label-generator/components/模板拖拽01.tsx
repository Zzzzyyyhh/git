"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { UseFormReturn } from "react-hook-form";

import {
  label12095DetailFixedLeftMm,
  label90DetailFixedLeftMm,
  type Label12095DetailKey,
  type Label90DetailKey,
  type LabelProjectPayload
} from "@/lib/labelSchema";
import type { TemplateKey } from "@/lib/templateCatalog";
import { label12095DetailOrder } from "@/lib/中文模板120_01";

type DragMode = "move" | "resize";
type LayoutKey = "title" | "category" | "netWeight";
type NutritionKey = "nutritionPanel";
type DetailKey = Label90DetailKey | Label12095DetailKey;

export type EditableTarget =
  | { group: "layout"; key: LayoutKey; label: string }
  | { group: "nutrition"; key: NutritionKey; label: string }
  | { group: "detail"; key: DetailKey; label: string };

const label90Targets: EditableTarget[] = [
  { group: "layout", key: "title", label: "标题" },
  { group: "layout", key: "category", label: "复合调味料" },
  { group: "layout", key: "netWeight", label: "净含量" },
  { group: "nutrition", key: "nutritionPanel", label: "营养成分表" },
  { group: "detail", key: "formalName", label: "产品名称" },
  { group: "detail", key: "ingredients", label: "配料表" },
  { group: "detail", key: "allergen", label: "致敏物质提示" },
  { group: "detail", key: "license", label: "许可证编号" },
  { group: "detail", key: "storage", label: "贮存条件" },
  { group: "detail", key: "date", label: "生产日期/保质期" },
  { group: "detail", key: "consignor", label: "委托商" },
  { group: "detail", key: "consignorAddress", label: "委托商地址" },
  { group: "detail", key: "consignorTel", label: "委托商电话" },
  { group: "detail", key: "manufacturer", label: "受委托商" },
  { group: "detail", key: "manufacturerAddress", label: "受委托商地址" },
  { group: "detail", key: "manufacturerTel", label: "受委托商电话" },
  { group: "detail", key: "countryOfOrigin", label: "产地" },
  { group: "detail", key: "standardCode", label: "产品执行标准" },
  { group: "detail", key: "usageMethod", label: "食用方法" },
  { group: "detail", key: "shelfLife", label: "保质期" },
  { group: "detail", key: "customRows", label: "自定义行" }
];

const label12095TargetLabels: Record<Label12095DetailKey, string> = {
  formalName: "产品名称",
  ingredients: "配料表",
  allergen: "致敏物质提示",
  license: "食品生产许可证编号",
  standardCode: "产品执行标准",
  storage: "贮存条件",
  shelfLife: "保质期",
  date: "生产日期及保质期到期日",
  usageMethod: "食用方法",
  consignor: "委托商",
  consignorAddress: "委托商地址",
  consignorTel: "委托商电话",
  manufacturer: "生产者名称",
  countryOfOrigin: "产地",
  manufacturerTel: "电话",
  manufacturerAddress: "地址",
  website: "官网"
};

const label12095Targets: EditableTarget[] = [
  { group: "layout", key: "title", label: "标题" },
  { group: "layout", key: "category", label: "复合调味料" },
  { group: "layout", key: "netWeight", label: "净含量" },
  { group: "nutrition", key: "nutritionPanel", label: "营养成分表" },
  ...label12095DetailOrder.map((key) => ({ group: "detail" as const, key, label: label12095TargetLabels[key] }))
];

type DragState = {
  target: EditableTarget;
  mode: DragMode;
  pointerX: number;
  pointerY: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  nutritionStart?: {
    nutritionTitle: { x: number; y: number };
    nutritionHeader: { x: number; y: number };
    nutritionRows: { x: number; y: number };
    nutritionRemark: { x: number; y: number };
  };
};

type OverlayRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function getTemplateTargets(templateKey: TemplateKey) {
  return templateKey === "label_120x95_cn" ? label12095Targets : label90Targets;
}

export function getEditableTargetId(target: EditableTarget) {
  return `${target.group}:${target.key}`;
}

export function getVisibleEditableTargets(templateKey: TemplateKey, data: LabelProjectPayload["data"]) {
  return getTemplateTargets(templateKey).filter((targetItem) => {
    if (targetItem.group === "nutrition" && data.label90NutritionHidden) {
      return false;
    }
    if (targetItem.group !== "detail") {
      return true;
    }
    if (templateKey === "label_120x95_cn") {
      return !data.label12095HiddenDetails.includes(targetItem.key as Label12095DetailKey);
    }
    return !data.label90HiddenDetails.includes(targetItem.key as Label90DetailKey);
  });
}

function getLayoutStoreKey(templateKey: TemplateKey) {
  return templateKey === "label_120x95_cn" ? "label12095Layout" : "label90Layout";
}

function getDetailStoreKey(templateKey: TemplateKey) {
  return templateKey === "label_120x95_cn" ? "label12095DetailBoxes" : "label90DetailBoxes";
}

function getFixedDetailLeft(templateKey: TemplateKey) {
  return templateKey === "label_120x95_cn" ? label12095DetailFixedLeftMm : label90DetailFixedLeftMm;
}

function detailAllowsHorizontalMove(templateKey: TemplateKey, key: DetailKey) {
  return templateKey === "label_90x120_cn" && key === "customRows";
}

function getBox(templateKey: TemplateKey, data: LabelProjectPayload["data"], target: EditableTarget) {
  const layoutStoreKey = getLayoutStoreKey(templateKey);
  const detailStoreKey = getDetailStoreKey(templateKey);

  if (target.group === "layout") {
    return data[layoutStoreKey][target.key];
  }

  if (target.group === "nutrition") {
    const layout = data[layoutStoreKey];
    const { nutritionTitle, nutritionRemark } = layout;
    return {
      x: nutritionTitle.x,
      y: nutritionTitle.y,
      width: nutritionTitle.width,
      height: nutritionRemark.y + nutritionRemark.height - nutritionTitle.y
    };
  }

  const detailBox = data[detailStoreKey][target.key as never] as { x: number; y: number; width: number; height: number };
  return {
    ...detailBox,
    x: detailAllowsHorizontalMove(templateKey, target.key) ? detailBox.x : getFixedDetailLeft(templateKey)
  };
}

function getFrameSize(templateKey: TemplateKey) {
  return templateKey === "label_120x95_cn" ? { width: 120, height: 95 } : { width: 90, height: 120 };
}

function getNutritionStart(form: UseFormReturn<LabelProjectPayload>, templateKey: TemplateKey) {
  const layoutStoreKey = getLayoutStoreKey(templateKey);
  const getNumber = (path: string) => form.getValues(path as never) as unknown as number;
  return {
    nutritionTitle: {
      x: getNumber(`data.${layoutStoreKey}.nutritionTitle.x`),
      y: getNumber(`data.${layoutStoreKey}.nutritionTitle.y`)
    },
    nutritionHeader: {
      x: getNumber(`data.${layoutStoreKey}.nutritionHeader.x`),
      y: getNumber(`data.${layoutStoreKey}.nutritionHeader.y`)
    },
    nutritionRows: {
      x: getNumber(`data.${layoutStoreKey}.nutritionRows.x`),
      y: getNumber(`data.${layoutStoreKey}.nutritionRows.y`)
    },
    nutritionRemark: {
      x: getNumber(`data.${layoutStoreKey}.nutritionRemark.x`),
      y: getNumber(`data.${layoutStoreKey}.nutritionRemark.y`)
    }
  };
}

export function 模板拖拽01({
  activeTarget,
  form,
  setActiveTarget,
  targetRef,
  templateKey
}: {
  activeTarget: string | null;
  form: UseFormReturn<LabelProjectPayload>;
  setActiveTarget: (target: string | null) => void;
  targetRef: RefObject<HTMLDivElement | null>;
  templateKey: TemplateKey;
}) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [overlayRects, setOverlayRects] = useState<Record<string, OverlayRect>>({});
  const data = form.watch("data");
  const scaleRef = useRef({ x: 1, y: 1 });
  const target = targetRef.current;

  const visibleTargets = useMemo(() => getVisibleEditableTargets(templateKey, data), [data, templateKey]);
  const targetMap = useMemo(
    () => new Map(visibleTargets.map((targetItem) => [getEditableTargetId(targetItem), targetItem])),
    [visibleTargets]
  );

  useEffect(() => {
    if (!dragState) {
      return;
    }

    const currentDrag = dragState;
    const layoutStoreKey = getLayoutStoreKey(templateKey);
    const detailStoreKey = getDetailStoreKey(templateKey);

    function handleMove(event: PointerEvent) {
      const deltaX = (event.clientX - currentDrag.pointerX) / scaleRef.current.x;
      const deltaY = (event.clientY - currentDrag.pointerY) / scaleRef.current.y;

      const xPath =
        currentDrag.target.group === "layout"
          ? `data.${layoutStoreKey}.${currentDrag.target.key}.x`
          : currentDrag.target.group === "detail"
            ? `data.${detailStoreKey}.${currentDrag.target.key}.x`
            : null;
      const yPath =
        currentDrag.target.group === "layout"
          ? `data.${layoutStoreKey}.${currentDrag.target.key}.y`
          : currentDrag.target.group === "detail"
            ? `data.${detailStoreKey}.${currentDrag.target.key}.y`
            : null;
      const widthPath =
        currentDrag.target.group === "layout"
          ? `data.${layoutStoreKey}.${currentDrag.target.key}.width`
          : currentDrag.target.group === "detail"
            ? `data.${detailStoreKey}.${currentDrag.target.key}.width`
            : null;
      const heightPath =
        currentDrag.target.group === "layout"
          ? `data.${layoutStoreKey}.${currentDrag.target.key}.height`
          : currentDrag.target.group === "detail"
            ? `data.${detailStoreKey}.${currentDrag.target.key}.height`
            : null;

      if (currentDrag.target.group === "nutrition") {
        const nutritionKeys = ["nutritionTitle", "nutritionHeader", "nutritionRows", "nutritionRemark"] as const;
        for (const key of nutritionKeys) {
          const original = currentDrag.nutritionStart?.[key];
          if (!original) {
            continue;
          }
          form.setValue(`data.${layoutStoreKey}.${key}.x` as never, Number((original.x + deltaX).toFixed(1)) as never, { shouldDirty: true });
          form.setValue(`data.${layoutStoreKey}.${key}.y` as never, Number((original.y + deltaY).toFixed(1)) as never, { shouldDirty: true });
        }
        return;
      }

      if (currentDrag.mode === "move" && xPath && yPath) {
        const nextX =
          currentDrag.target.group === "detail" && !detailAllowsHorizontalMove(templateKey, currentDrag.target.key)
            ? getFixedDetailLeft(templateKey)
            : Number((currentDrag.startX + deltaX).toFixed(1));
        form.setValue(xPath as never, nextX as never, { shouldDirty: true });
        form.setValue(yPath as never, Number((currentDrag.startY + deltaY).toFixed(1)) as never, { shouldDirty: true });
      } else if (widthPath && heightPath) {
        form.setValue(widthPath as never, Math.max(4, Number((currentDrag.startWidth + deltaX).toFixed(1))) as never, { shouldDirty: true });
        form.setValue(heightPath as never, Math.max(3, Number((currentDrag.startHeight + deltaY).toFixed(1))) as never, { shouldDirty: true });
      }
    }

    function handleUp() {
      setDragState(null);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragState, form, templateKey]);

  useLayoutEffect(() => {
    if (!target) {
      return;
    }

    const updateRects = () => {
      const containerRect = target.getBoundingClientRect();
      const frameElement = target.querySelector<HTMLElement>("[data-label-frame='true']");
      const frameRect = frameElement?.getBoundingClientRect() ?? containerRect;
      const frameOffsetLeft = frameRect.left - containerRect.left;
      const frameOffsetTop = frameRect.top - containerRect.top;
      const nextRects: Record<string, OverlayRect> = {};

      for (const targetItem of visibleTargets) {
        const id = getEditableTargetId(targetItem);
        const box = getBox(templateKey, data, targetItem);
        nextRects[id] = {
          left: frameOffsetLeft + box.x * scaleRef.current.x,
          top: frameOffsetTop + box.y * scaleRef.current.y,
          width: box.width * scaleRef.current.x,
          height: box.height * scaleRef.current.y
        };
      }

      setOverlayRects(nextRects);
    };

    updateRects();
    const frame = window.requestAnimationFrame(updateRects);
    const resizeObserver = new ResizeObserver(() => updateRects());
    resizeObserver.observe(target);

    window.addEventListener("resize", updateRects);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateRects);
    };
  }, [target, visibleTargets, data, templateKey]);

  useEffect(() => {
    if (!activeTarget) {
      return;
    }

    if (!visibleTargets.some((targetItem) => getEditableTargetId(targetItem) === activeTarget)) {
      setActiveTarget(null);
    }
  }, [activeTarget, setActiveTarget, visibleTargets]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!(event.target instanceof Element)) {
        return;
      }

      const editableElement = event.target.closest<HTMLElement>("[data-editable-id]");
      if (!editableElement) {
        setActiveTarget(null);
        return;
      }

      if (event.target.closest("[data-resize-handle='true']")) {
        return;
      }

      const id = editableElement.dataset.editableId;
      if (!id) {
        return;
      }

      const targetItem = targetMap.get(id);
      if (!targetItem) {
        return;
      }

      const box = getBox(templateKey, form.getValues("data"), targetItem);
      setActiveTarget(id);
      setDragState({
        target: targetItem,
        mode: "move",
        pointerX: event.clientX,
        pointerY: event.clientY,
        startX: box.x,
        startY: box.y,
        startWidth: box.width,
        startHeight: box.height,
        nutritionStart: targetItem.group === "nutrition" ? getNutritionStart(form, templateKey) : undefined
      });
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [form, setActiveTarget, targetMap, templateKey]);

  if (!target) {
    return null;
  }

  const frame = target.querySelector<HTMLElement>("[data-label-frame='true']");
  const frameBounds = frame?.getBoundingClientRect() ?? target.getBoundingClientRect();
  const frameSize = getFrameSize(templateKey);
  scaleRef.current = {
    x: frameBounds.width / frameSize.width,
    y: frameBounds.height / frameSize.height
  };

  return (
    <div className="pointer-events-none absolute inset-0">
      {activeTarget && overlayRects[activeTarget] && targetMap.get(activeTarget)
        ? (() => {
            const targetItem = targetMap.get(activeTarget)!;
            const rect = overlayRects[activeTarget];
            const box = getBox(templateKey, data, targetItem);

            return (
              <div
                className="pointer-events-auto absolute rounded-[14px] border-2 border-sky-500/95 bg-sky-500/10 shadow-[0_0_0_1px_rgba(14,165,233,0.28)]"
                style={{
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                  cursor: dragState?.mode === "move" ? "grabbing" : "grab"
                }}
                onPointerDown={(event) => {
                  if (event.target instanceof Element && event.target.closest("[data-resize-handle='true']")) {
                    return;
                  }

                  event.stopPropagation();
                  setDragState({
                    target: targetItem,
                    mode: "move",
                    pointerX: event.clientX,
                    pointerY: event.clientY,
                    startX: box.x,
                    startY: box.y,
                    startWidth: box.width,
                    startHeight: box.height,
                    nutritionStart: targetItem.group === "nutrition" ? getNutritionStart(form, templateKey) : undefined
                  });
                }}
              >
                <div className="absolute left-2 top-2 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                  {targetItem.label}
                </div>
                <button
                  className="absolute -bottom-2 -right-2 h-5 w-5 rounded-full border-2 border-white bg-sky-500 shadow-[0_4px_12px_rgba(14,165,233,0.4)]"
                  data-resize-handle="true"
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    setDragState({
                      target: targetItem,
                      mode: "resize",
                      pointerX: event.clientX,
                      pointerY: event.clientY,
                      startX: box.x,
                      startY: box.y,
                      startWidth: box.width,
                      startHeight: box.height,
                      nutritionStart: undefined
                    });
                  }}
                  type="button"
                />
              </div>
            );
          })()
        : null}
    </div>
  );
}
