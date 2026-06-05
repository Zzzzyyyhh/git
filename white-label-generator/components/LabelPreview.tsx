"use client";

import type { ReactNode, RefObject } from "react";

import { getTemplate } from "@/lib/templates";
import type { LabelData } from "@/lib/labelSchema";

export function LabelPreview({
  templateKey,
  data,
  overlay,
  previewRef,
  previewScale = 1
}: {
  templateKey: string;
  data: LabelData;
  overlay?: ReactNode;
  previewRef?: RefObject<HTMLDivElement | null>;
  previewScale?: number;
}) {
  const template = getTemplate(templateKey);
  const TemplateComponent = template.Component;

  return (
    <div className="overflow-auto rounded-[28px] border border-black/10 bg-[#f2efe7] p-4 shadow-panel">
      <div className="relative mx-auto min-w-max" ref={previewRef} style={{ zoom: previewScale }}>
        <TemplateComponent data={data} templateKey={template.key} />
        {overlay}
      </div>
    </div>
  );
}
