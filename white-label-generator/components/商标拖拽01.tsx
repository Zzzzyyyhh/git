"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { LabelProjectPayload } from "@/lib/labelSchema";
import type { TemplateKey } from "@/lib/templateCatalog";

type DragMode = "move" | "resize";

type DragState = {
  mode: DragMode;
  pointerX: number;
  pointerY: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
};

const templateSizeMap: Record<TemplateKey, { width: number; height: number }> = {
  label_90x120_cn: { width: 90, height: 120 },
  label_120x95_cn: { width: 120, height: 95 }
};

export function 商标拖拽01({
  form,
  targetRef,
  templateKey
}: {
  form: UseFormReturn<LabelProjectPayload>;
  targetRef: RefObject<HTMLDivElement | null>;
  templateKey: TemplateKey;
}) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const scaleRef = useRef({ x: 1, y: 1 });
  const data = form.watch("data");

  useEffect(() => {
    if (!dragState) {
      return;
    }

    const currentDrag = dragState;
    const basePath = `data.logoBoxes.${templateKey}` as const;

    function handleMove(event: PointerEvent) {
      const deltaX = (event.clientX - currentDrag.pointerX) / scaleRef.current.x;
      const deltaY = (event.clientY - currentDrag.pointerY) / scaleRef.current.y;

      if (currentDrag.mode === "move") {
        form.setValue(`${basePath}.x` as never, Number((currentDrag.startX + deltaX).toFixed(1)) as never, { shouldDirty: true });
        form.setValue(`${basePath}.y` as never, Number((currentDrag.startY + deltaY).toFixed(1)) as never, { shouldDirty: true });
        return;
      }

      form.setValue(`${basePath}.width` as never, Math.max(4, Number((currentDrag.startWidth + deltaX).toFixed(1))) as never, {
        shouldDirty: true
      });
      form.setValue(`${basePath}.height` as never, Math.max(4, Number((currentDrag.startHeight + deltaY).toFixed(1))) as never, {
        shouldDirty: true
      });
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

  if (data.logoKind === "none") {
    return null;
  }

  const target = targetRef.current;
  if (!target) {
    return null;
  }

  const templateSize = templateSizeMap[templateKey];
  const box = data.logoBoxes[templateKey];
  const frame = target.querySelector<HTMLElement>("[data-label-frame='true']");
  const targetBounds = target.getBoundingClientRect();
  const bounds = frame?.getBoundingClientRect() ?? targetBounds;
  const offsetLeft = bounds.left - targetBounds.left;
  const offsetTop = bounds.top - targetBounds.top;
  scaleRef.current = {
    x: bounds.width / templateSize.width,
    y: bounds.height / templateSize.height
  };

  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="pointer-events-auto absolute cursor-move border border-dashed border-emerald-400/80 bg-emerald-400/8"
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragState({
            mode: "move",
            pointerX: event.clientX,
            pointerY: event.clientY,
            startX: box.x,
            startY: box.y,
            startWidth: box.width,
            startHeight: box.height
          });
        }}
        style={{
          left: offsetLeft + box.x * scaleRef.current.x,
          top: offsetTop + box.y * scaleRef.current.y,
          width: box.width * scaleRef.current.x,
          height: box.height * scaleRef.current.y
        }}
      >
        <div className="absolute -top-5 left-0 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
          商标
        </div>
        <div
          className="absolute bottom-[-5px] right-[-5px] h-3 w-3 cursor-se-resize rounded-[2px] border border-white bg-emerald-500 shadow"
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setDragState({
              mode: "resize",
              pointerX: event.clientX,
              pointerY: event.clientY,
              startX: box.x,
              startY: box.y,
              startWidth: box.width,
              startHeight: box.height
            });
          }}
        />
      </div>
    </div>
  );
}
