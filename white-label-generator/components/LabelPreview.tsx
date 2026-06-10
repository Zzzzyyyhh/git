"use client";

import type { ReactNode, RefObject } from "react";

import { getTemplate } from "@/lib/templates";
import { getTemplateMeta } from "@/lib/templateCatalog";
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
  const meta = getTemplateMeta(templateKey);
  const TemplateComponent = template.Component;

  return (
    <div className="lp-card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[color:var(--lp-line)] bg-white/66 px-4 py-3">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--lp-muted)]">Live Preview</div>
          <div className="mt-1 text-sm font-medium text-[color:var(--lp-ink)]">{template.name}</div>
        </div>
        <div className="rounded-full border border-[rgba(208,174,102,0.36)] bg-[rgba(208,174,102,0.14)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--lp-red-deep)]">
          {template.sizeLabel}
        </div>
      </div>

      <div
        style={{
          width: `calc(${meta.outerWidthMm}mm * ${previewScale})`,
          height: `calc(${meta.outerHeightMm}mm * ${previewScale})`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          ref={previewRef}
          style={{
            transform: `scale(${previewScale})`,
            transformOrigin: "top left",
          }}
        >
          <TemplateComponent data={data} templateKey={template.key} />
        </div>
        {overlay}
      </div>
    </div>
  );
}
