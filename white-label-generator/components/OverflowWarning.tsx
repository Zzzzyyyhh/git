"use client";

import { fieldCharacterLimits, labelFieldLabels, type LabelData } from "@/lib/labelSchema";

export function getOverflowWarnings(data: LabelData) {
  return Object.entries(fieldCharacterLimits)
    .flatMap(([field, limit]) => {
      const typedField = field as keyof LabelData;
      const value = data[typedField] ?? "";

      if (!limit || typeof value !== "string" || value.length <= limit) {
        return [];
      }

      return [
        {
          field: typedField,
          label: labelFieldLabels[typedField],
          count: value.length,
          limit
        }
      ];
    })
    .sort((a, b) => b.count - a.count);
}

export function OverflowWarning({ data }: { data: LabelData }) {
  const warnings = getOverflowWarnings(data);

  if (warnings.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        当前字段长度在建议范围内。 / Current content lengths are within the suggested range.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-semibold">发现可能溢出的字段 / Potential overflow warnings</p>
      <ul className="mt-2 space-y-1">
        {warnings.map((warning) => (
          <li key={warning.field}>
            {warning.label} 当前 {warning.count} 字符，建议控制在 {warning.limit} 字符以内。 / Suggested under {warning.limit} characters.
          </li>
        ))}
      </ul>
    </div>
  );
}
