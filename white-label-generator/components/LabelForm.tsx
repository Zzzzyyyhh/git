"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { LabelPreview } from "@/components/LabelPreview";
import { OverflowWarning } from "@/components/OverflowWarning";
import { 商标拖拽01 } from "@/components/商标拖拽01";
import { getEditableTargetId, getVisibleEditableTargets, 模板拖拽01 } from "@/components/模板拖拽01";
import { getErrorMessage } from "@/lib/errors";
import {
  createDefaultProjectPayload,
  createEmptyLabelData,
  createExampleLabelData,
  label90DetailKeySchema,
  labelProjectSchema,
  labelStatusSchema,
  type Label12095DetailKey,
  type Label12095Layout,
  type Label90DetailKey,
  type Label90Layout,
  type LabelProjectPayload
} from "@/lib/labelSchema";
import { templates } from "@/lib/templates";
import { label12095DetailOrder } from "@/lib/中文模板120_01";

type LabelFormProps = {
  mode: "create" | "edit";
  initialValue?: LabelProjectPayload & { id?: string };
  templateDefaults?: Partial<Record<LabelProjectPayload["templateKey"], LabelProjectPayload["data"]>>;
};

const textFields: Array<{ name: keyof LabelProjectPayload["data"]; label: string; labelCn: string; rows?: number }> = [
  { name: "productNameCn", label: "标题 / Title", labelCn: "标题" },
  { name: "productFormalNameCn", label: "产品名称 / Product Name", labelCn: "产品名称" },
  { name: "productCategoryCn", label: "调味品种类 / Category", labelCn: "调味品种类" },
  { name: "netWeight", label: "净含量 / Net Weight", labelCn: "净含量" },
  { name: "ingredients", label: "配料表 / Ingredients", labelCn: "配料表", rows: 5 },
  { name: "allergenDeclaration", label: "致敏物质提示 / Allergen Declaration", labelCn: "致敏物质提示", rows: 2 },
  { name: "productionDateAndLotNumber", label: "生产日期及保质期到期日 / Production Date", labelCn: "生产日期及保质期到期日" },
  { name: "shelfLife", label: "保质期 / Shelf Life", labelCn: "保质期" },
  { name: "storageCondition", label: "贮存条件 / Storage Condition", labelCn: "贮存条件", rows: 3 },
  { name: "usageMethod", label: "食用方法 / Usage Method", labelCn: "食用方法" },
  { name: "countryOfOrigin", label: "产地 / Country of Origin", labelCn: "产地" },
  { name: "productionLicenseNumber", label: "食品生产许可证编号 / Production License Number", labelCn: "食品生产许可证编号" },
  { name: "productStandardCode", label: "产品执行标准 / Product Standard Code", labelCn: "产品执行标准" },
  { name: "consignor", label: "委托商 / Consignor", labelCn: "委托商" },
  { name: "consignorAddress", label: "委托商地址 / Consignor Address", labelCn: "委托商地址", rows: 3 },
  { name: "consignorTel", label: "委托商电话 / Consignor Tel", labelCn: "委托商电话" },
  { name: "manufacturer", label: "受委托商 / Manufacturer", labelCn: "受委托商" },
  { name: "manufacturerAddress", label: "受委托商地址 / Manufacturer Address", labelCn: "受委托商地址", rows: 3 },
  { name: "manufacturerTel", label: "受委托商电话 / Manufacturer Tel", labelCn: "受委托商电话" }
];

const label90HiddenFieldNames = new Set<keyof LabelProjectPayload["data"]>();

const nutritionRowFields: Array<{
  key: string;
  label: string;
  valueName: keyof LabelProjectPayload["data"];
  nrvName: keyof LabelProjectPayload["data"];
}> = [
  { key: "energy", label: "能量", valueName: "nutritionEnergy", nrvName: "nutritionEnergyNrv" },
  { key: "protein", label: "蛋白质", valueName: "nutritionProtein", nrvName: "nutritionProteinNrv" },
  { key: "fat", label: "脂肪", valueName: "nutritionFat", nrvName: "nutritionFatNrv" },
  { key: "saturatedFat", label: "-饱和脂肪", valueName: "nutritionSaturatedFat", nrvName: "nutritionSaturatedFatNrv" },
  { key: "carbohydrate", label: "碳水化合物", valueName: "nutritionCarbohydrate", nrvName: "nutritionCarbohydrateNrv" },
  { key: "sugar", label: "-糖", valueName: "nutritionSugar", nrvName: "nutritionSugarNrv" },
  { key: "sodium", label: "钠", valueName: "nutritionSodium", nrvName: "nutritionSodiumNrv" }
];

const label90LayoutFields: Array<{
  key: keyof Label90Layout;
  label: string;
  hasLineHeight?: boolean;
}> = [
  { key: "title", label: "标题" },
  { key: "category", label: "复合调味料" },
  { key: "netWeight", label: "净含量" }
];
const label12095LayoutFields: Array<{
  key: keyof Label12095Layout;
  label: string;
}> = [
  { key: "title", label: "标题" },
  { key: "category", label: "复合调味料" },
  { key: "netWeight", label: "净含量" }
];
const detailFieldLabels: Record<Label90DetailKey, string> = {
  formalName: "产品名称",
  ingredients: "配料表",
  allergen: "致敏物质提示",
  license: "食品生产许可证编号",
  storage: "贮存条件",
  date: "生产日期及保质期到期日",
  consignor: "委托商",
  consignorAddress: "委托商地址",
  consignorTel: "委托商电话",
  manufacturer: "受委托商",
  manufacturerAddress: "受委托商地址",
  manufacturerTel: "受委托商电话",
  countryOfOrigin: "产地",
  standardCode: "产品执行标准",
  usageMethod: "食用方法",
  shelfLife: "保质期",
  customRows: "自定义行汇总"
};
const detailFieldLabels12095: Record<Label12095DetailKey, string> = {
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

const statusOptions = labelStatusSchema.options;
const detailFieldKeys = label90DetailKeySchema.options;
const chineseLabelTemplateKeys = new Set<LabelProjectPayload["templateKey"]>(["label_90x120_cn", "label_120x95_cn"]);
const draggableChineseTemplateKeys = new Set<LabelProjectPayload["templateKey"]>(["label_90x120_cn", "label_120x95_cn"]);

export function LabelForm({ mode, initialValue, templateDefaults = {} }: LabelFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [exporting, setExporting] = useState<null | "pdf" | "png">(null);
  const [savingTemplateDefault, setSavingTemplateDefault] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [activeLabel90Target, setActiveLabel90Target] = useState<string | null>(null);
  const form = useForm<LabelProjectPayload>({
    resolver: zodResolver(labelProjectSchema),
    defaultValues: initialValue ?? createDefaultProjectPayload()
  });
  const previewRef = useRef<HTMLDivElement>(null);

  const values = form.watch();
  const previewValues = useDeferredValue(values);
  const template = useMemo(() => templates[previewValues.templateKey], [previewValues.templateKey]);
  const visibleTextFields = useMemo(
    () => textFields.filter((field) => (chineseLabelTemplateKeys.has(previewValues.templateKey) ? !label90HiddenFieldNames.has(field.name) : true)),
    [previewValues.templateKey]
  );
  const previewTextTargets = useMemo(
    () => getVisibleEditableTargets(previewValues.templateKey, previewValues.data),
    [previewValues.data, previewValues.templateKey]
  );
  const isChineseTemplate = template.variant === "cn";
  const previousTemplateKeyRef = useRef(values.templateKey);

  useEffect(() => {
    if (!draggableChineseTemplateKeys.has(previewValues.templateKey)) {
      setActiveLabel90Target(null);
    }
  }, [previewValues.templateKey]);

  useEffect(() => {
    if (values.templateKey !== "label_90x120_cn") {
      return;
    }

    const current = form.getValues("data.label90HiddenDetails");
    if (!current.includes("manufacturerTel")) {
      return;
    }

    form.setValue(
      "data.label90HiddenDetails",
      current.filter((item) => item !== "manufacturerTel"),
      { shouldDirty: false }
    );
  }, [form, values.templateKey]);

  function getDataForTemplate(templateKey: LabelProjectPayload["templateKey"]) {
    return structuredClone(templateDefaults[templateKey] ?? createEmptyLabelData());
  }

  useEffect(() => {
    if (mode !== "create") {
      return;
    }

    const previousTemplateKey = previousTemplateKeyRef.current;
    if (previousTemplateKey === values.templateKey) {
      return;
    }

    previousTemplateKeyRef.current = values.templateKey;
    form.setValue("data", getDataForTemplate(values.templateKey), { shouldDirty: true });
    setActionNotice(null);
    setActionError(null);
  }, [form, mode, templateDefaults, values.templateKey]);

  function handleLoadExample() {
    form.setValue("data", createExampleLabelData(), { shouldDirty: true });
    if (!form.getValues("name").trim()) {
      form.setValue("name", "示例标签项目", { shouldDirty: true });
    }
    setActionNotice("已载入示例数据，可在此基础上继续调整。");
    setActionError(null);
  }

  async function saveProject(payload: LabelProjectPayload) {
    setActionError(null);
    setActionNotice(null);
    const endpoint = mode === "create" ? "/api/labels" : `/api/labels/${initialValue?.id}`;
    const method = mode === "create" ? "POST" : "PUT";
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(await extractResponseError(response, "保存失败"));
    }

    const project = (await response.json()) as { id: string };
    startTransition(() => {
      router.push(`/labels/${project.id}/edit`);
      router.refresh();
    });
  }

  async function handleExport(format: "pdf" | "png") {
    setExporting(format);
    try {
      setActionError(null);
      const response = await fetch(`/api/export/${format}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          templateKey: form.getValues("templateKey"),
          data: form.getValues("data")
        })
      });

      if (!response.ok) {
        throw new Error(await extractResponseError(response, `导出 ${format.toUpperCase()} 失败`));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${form.getValues("name").replace(/\s+/g, "-").toLowerCase() || "label"}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setExporting(null);
    }
  }

  function handleCustomLogoUpload(file: File | null) {
    if (!file) {
      return;
    }

    if (file.type !== "image/png") {
      setActionError("请上传 PNG 格式的商标图片。");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setActionError("商标图片读取失败，请重新上传。");
        return;
      }

      setActionError(null);
      form.setValue("data.customLogoPng", reader.result, { shouldDirty: true });
      form.setValue("data.logoKind", "custom", { shouldDirty: true });
    };
    reader.onerror = () => setActionError("商标图片读取失败，请重新上传。");
    reader.readAsDataURL(file);
  }

  async function handleSaveTemplateDefault() {
    setSavingTemplateDefault(true);
    setActionError(null);
    setActionNotice(null);

    try {
      const response = await fetch("/api/模板默认01", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          templateKey: form.getValues("templateKey"),
          data: form.getValues("data")
        })
      });

      if (!response.ok) {
        throw new Error(await extractResponseError(response, "保存模板默认值失败"));
      }

      setActionNotice(`已保存 ${templates[form.getValues("templateKey")].name} 的模板默认值。`);
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setSavingTemplateDefault(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(640px,1.08fr)]">
      <div className="lp-card p-5 sm:p-6 backdrop-blur">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="lp-kicker">
              {mode === "create" ? "Create Project" : "Edit Project"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">标签信息工作台</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--lp-muted-strong)]">
              集中维护模板、文本内容、商标与营养表配置；右侧同步预览，保留核心导出路径。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {mode === "edit" && initialValue ? (
              <Link
                className="lp-btn-secondary px-4 py-2 text-sm"
                href={`/labels/${initialValue.id}/preview`}
              >
                独立预览页
              </Link>
            ) : null}
            {mode === "edit" ? (
              <button
                className="lp-btn-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                disabled={savingTemplateDefault}
                onClick={handleSaveTemplateDefault}
                type="button"
              >
                {savingTemplateDefault ? "保存默认值中..." : "保存为模板默认值"}
              </button>
            ) : null}
            <button
              className="lp-btn-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={exporting !== null}
              onClick={() => handleExport("png")}
              type="button"
            >
              {exporting === "png" ? "导出中..." : "导出 PNG"}
            </button>
            <button
              className="lp-btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={exporting !== null}
              onClick={() => handleExport("pdf")}
              type="button"
            >
              {exporting === "pdf" ? "导出中..." : "导出 PDF"}
            </button>
          </div>
        </div>

        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(async (payload) => {
            try {
              await saveProject(payload);
            } catch (error) {
              setActionError(getErrorMessage(error));
            }
          })}
        >
          {actionError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
          ) : null}
          {actionNotice ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{actionNotice}</div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium">项目名称 / Project Name</span>
              <input
                className="lp-input"
                {...form.register("name")}
              />
              <FieldError message={form.formState.errors.name?.message} />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">标签版本 / Label Template</span>
              <select
                className="lp-input"
                {...form.register("templateKey")}
              >
                {Object.values(templates).map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">状态 / Status</span>
              <select
                className="lp-input"
                {...form.register("status")}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <div className="lp-panel border-dashed px-4 py-3 text-sm text-[color:var(--lp-muted-strong)]">
              当前模板 / Active Template: {template.name}
              <br />
              成品尺寸 / Final Size: {template.sizeLabel}
            </div>
          </div>

          {mode === "create" ? (
            <section className="lp-section flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <h3 className="text-base font-semibold">空态创建 / Empty Start</h3>
                <p className="mt-1 text-sm text-[color:var(--lp-muted-strong)]">新建项目默认使用当前模板的默认值；如果没有默认值，则从干净空白表单开始。</p>
              </div>
              <button
                className="lp-btn-secondary px-4 py-2 text-sm"
                onClick={handleLoadExample}
                type="button"
              >
                载入示例
              </button>
            </section>
          ) : null}

          <section className="lp-section space-y-4 p-4">
            <div>
              <h3 className="text-base font-semibold">商标设置 / Logo</h3>
              <p className="mt-1 text-sm text-[color:var(--lp-muted-strong)]">所有模板都可切换不加入、图片标、文字标。位置和大小请直接在右侧预览里拖动调整。</p>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium">商标类型 / Logo Type</span>
              <select
                className="lp-input"
                {...form.register("data.logoKind")}
              >
                <option value="none">不加入商标</option>
                <option value="image">图片标</option>
                <option value="text">文字标</option>
                <option value="custom">上传商标 PNG</option>
              </select>
            </label>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <label className="space-y-2">
                <span className="text-sm font-medium">上传客户商标 PNG / Upload PNG</span>
                <input
                  accept="image/png"
                  className="lp-input text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[color:var(--lp-red-deep)] file:px-4 file:py-2 file:text-sm file:text-white"
                  onChange={(event) => handleCustomLogoUpload(event.target.files?.[0] ?? null)}
                  type="file"
                />
              </label>
              <button
                className="lp-btn-secondary self-end px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!form.watch("data.customLogoPng")}
                onClick={() => {
                  form.setValue("data.customLogoPng", "", { shouldDirty: true });
                  if (form.getValues("data.logoKind") === "custom") {
                    form.setValue("data.logoKind", "none", { shouldDirty: true });
                  }
                }}
                type="button"
              >
                清除上传
              </button>
            </div>

            {form.watch("data.customLogoPng") ? (
              <div className="lp-panel flex items-center gap-3 bg-white/72 p-3">
                <div className="flex h-14 w-20 items-center justify-center overflow-hidden rounded-xl border border-[color:var(--lp-line)] bg-[rgba(255,251,246,0.88)]">
                  <img alt="上传商标预览" className="max-h-full max-w-full object-contain" src={form.watch("data.customLogoPng")} />
                </div>
                <div className="text-sm text-[color:var(--lp-muted-strong)]">已上传客户商标 PNG，可选择“上传商标 PNG”并在右侧预览中拖动和缩放。</div>
              </div>
            ) : null}
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            {visibleTextFields.map((field) => (
              <label className={`space-y-2 ${field.rows ? "md:col-span-2" : ""}`} key={field.name}>
                <span className="text-sm font-medium">{isChineseTemplate ? field.labelCn : field.label}</span>
                {field.rows ? (
                  <textarea
                    className="lp-input min-h-24"
                    rows={field.rows}
                    {...form.register(`data.${field.name}`)}
                  />
                ) : (
                  <input
                    className="lp-input"
                    {...form.register(`data.${field.name}`)}
                  />
                )}
                <FieldError message={form.formState.errors.data?.[field.name]?.message} />
              </label>
            ))}
          </div>

          <section className="lp-section space-y-4 p-4">
            <div>
              <h3 className="text-base font-semibold">营养成分表 / Nutrition Panel</h3>
              <p className="mt-1 text-sm text-[color:var(--lp-muted-strong)]">按固定 7 行录入营养成分值和营养素参考值%，模板会自动生成紧凑表格。</p>
            </div>

            {chineseLabelTemplateKeys.has(previewValues.templateKey) ? (
              <label className="lp-panel flex items-center gap-3 bg-white/72 px-4 py-3 text-sm font-medium">
                <input
                  checked={!form.watch("data.label90NutritionHidden")}
                  onChange={(event) => form.setValue("data.label90NutritionHidden", !event.target.checked, { shouldDirty: true })}
                  type="checkbox"
                />
                <span>显示营养成分表</span>
              </label>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">{isChineseTemplate ? "表头份量" : "表头份量 / Serving Size"}</span>
                <input
                  className="lp-input"
                  {...form.register("data.nutritionServingSize")}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">{isChineseTemplate ? "营养备注" : "营养备注 / Nutrition Remark"}</span>
                <input
                  className="lp-input"
                  {...form.register("data.nutritionRemark")}
                />
              </label>
            </div>

            <div className="space-y-3">
              {nutritionRowFields.map((row) => (
                <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)_120px]" key={row.key}>
                  <div className="lp-panel flex items-center bg-white/72 px-4 py-3 text-sm font-medium">{row.label}</div>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">含量值</span>
                    <input
                      className="lp-input"
                      {...form.register(`data.${row.valueName}`)}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">营养素参考值%</span>
                    <input
                      className="lp-input"
                      {...form.register(`data.${row.nrvName}`)}
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>

          {previewValues.templateKey === "label_90x120_cn" ? (
            <>
              <section className="lp-section space-y-4 p-4">
                <div>
                  <h3 className="text-base font-semibold">90×120 模板微调 / 90×120 Layout Controls</h3>
                  <p className="mt-1 text-sm text-[color:var(--lp-muted-strong)]">
                    位置只通过右侧拖动文本框调整。这里仅保留 3 个主文字的字符高度设置，单位使用 pt。
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {label90LayoutFields.map((field) => (
                    <div className="lp-panel bg-white/72 p-4" key={field.key}>
                      <NumberInput controlLabel={`${field.label} 字符高度(pt)`} registerPath={`data.label90Layout.${field.key}.fontSize`} form={form} step="0.1" />
                    </div>
                  ))}
                </div>
              </section>

              <section className="lp-section space-y-4 p-4">
                <div>
                  <h3 className="text-base font-semibold">详情字段控制 / Detail Textboxes</h3>
                  <p className="mt-1 text-sm text-[color:var(--lp-muted-strong)]">统一调整详情小字字号和行高。每个字段可独立勾选显示；位置更新请直接拖动右侧文本框。</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <NumberInput controlLabel="详情统一字号(pt)" registerPath="data.label90DetailFontSizePt" form={form} step="0.1" />
                  <NumberInput controlLabel="详情统一行高" registerPath="data.label90DetailLineHeight" form={form} step="0.01" />
                </div>

                <div className="space-y-3">
                  {detailFieldKeys.map((detailKey) => {
                    const hidden = form.watch("data.label90HiddenDetails").includes(detailKey);

                    return (
                      <div className="lp-panel bg-white/72 p-4" key={detailKey}>
                        <div className="flex items-center justify-between gap-3">
                          <label className="flex items-center gap-3 text-sm font-semibold">
                            <input
                              checked={!hidden}
                              onChange={(event) => {
                                const current = form.getValues("data.label90HiddenDetails");
                                if (event.target.checked) {
                                  form.setValue(
                                    "data.label90HiddenDetails",
                                    current.filter((item) => item !== detailKey),
                                    { shouldDirty: true }
                                  );
                                } else if (!current.includes(detailKey)) {
                                  form.setValue("data.label90HiddenDetails", [...current, detailKey], { shouldDirty: true });
                                }
                              }}
                              type="checkbox"
                          />
                          <span>{detailFieldLabels[detailKey]}</span>
                        </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          ) : previewValues.templateKey === "label_120x95_cn" ? (
            <>
              <section className="lp-section space-y-4 p-4">
                <div>
                  <h3 className="text-base font-semibold">120×95 模板微调 / 120×95 Layout Controls</h3>
                  <p className="mt-1 text-sm text-[color:var(--lp-muted-strong)]">
                    位置只通过右侧拖动文本框调整。这里保留 3 个主文字的字符高度设置，单位使用 pt。
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {label12095LayoutFields.map((field) => (
                    <div className="lp-panel bg-white/72 p-4" key={field.key}>
                      <NumberInput controlLabel={`${field.label} 字符高度(pt)`} registerPath={`data.label12095Layout.${field.key}.fontSize`} form={form} step="0.1" />
                    </div>
                  ))}
                </div>
              </section>

              <section className="lp-section space-y-4 p-4">
                <div>
                  <h3 className="text-base font-semibold">120×95 详情字段控制 / Detail Textboxes</h3>
                  <p className="mt-1 text-sm text-[color:var(--lp-muted-strong)]">统一调整详情小字字号和行高。每个字段可独立勾选显示；位置更新请直接拖动右侧文本框。</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <NumberInput controlLabel="详情统一字号(pt)" registerPath="data.label12095DetailFontSizePt" form={form} step="0.1" />
                  <NumberInput controlLabel="详情统一行高" registerPath="data.label12095DetailLineHeight" form={form} step="0.01" />
                </div>

                <div className="space-y-3">
                  {label12095DetailOrder.map((detailKey) => {
                    const hidden = form.watch("data.label12095HiddenDetails").includes(detailKey);

                    return (
                      <div className="lp-panel bg-white/72 p-4" key={detailKey}>
                        <div className="flex items-center justify-between gap-3">
                          <label className="flex items-center gap-3 text-sm font-semibold">
                            <input
                              checked={!hidden}
                              onChange={(event) => {
                                const current = form.getValues("data.label12095HiddenDetails");
                                if (event.target.checked) {
                                  form.setValue(
                                    "data.label12095HiddenDetails",
                                    current.filter((item) => item !== detailKey),
                                    { shouldDirty: true }
                                  );
                                } else if (!current.includes(detailKey)) {
                                  form.setValue("data.label12095HiddenDetails", [...current, detailKey], { shouldDirty: true });
                                }
                              }}
                              type="checkbox"
                            />
                            <span>{detailFieldLabels12095[detailKey]}</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          ) : null}


          <div className="flex items-center justify-between gap-3 border-t border-[color:var(--lp-line)] pt-4">
            <Link className="text-sm text-[color:var(--lp-muted-strong)] hover:text-[color:var(--lp-red-deep)]" href="/labels">
              返回列表
            </Link>
            <button
              className="lp-btn-primary px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending || form.formState.isSubmitting}
              type="submit"
            >
              {mode === "create"
                ? form.formState.isSubmitting
                  ? "创建中..."
                  : "创建标签项目"
                : form.formState.isSubmitting
                  ? "保存中..."
                  : "保存修改"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
        <OverflowWarning data={previewValues.data} />
        <div className={draggableChineseTemplateKeys.has(previewValues.templateKey) ? "grid grid-cols-[minmax(0,1fr)_148px] gap-3" : ""}>
          <LabelPreview
            data={previewValues.data}
            overlay={
              <>
                <商标拖拽01 form={form} targetRef={previewRef} templateKey={previewValues.templateKey} />
                {draggableChineseTemplateKeys.has(previewValues.templateKey) ? (
                  <模板拖拽01
                    activeTarget={activeLabel90Target}
                    form={form}
                    setActiveTarget={setActiveLabel90Target}
                    templateKey={previewValues.templateKey}
                    targetRef={previewRef}
                  />
                ) : null}
              </>
            }
            previewScale={1.3}
            previewRef={previewRef}
            templateKey={previewValues.templateKey}
          />
          {draggableChineseTemplateKeys.has(previewValues.templateKey) ? (
            <div className="lp-card rounded-[22px] p-2">
              <div className="grid gap-1.5">
                {previewTextTargets.map((target) => {
                  const targetId = getEditableTargetId(target);
                  const active = activeLabel90Target === targetId;

                  return (
                    <button
                      className={`rounded-xl border px-2.5 py-2 text-left text-xs font-medium transition ${
                        active
                          ? "border-[rgba(159,24,32,0.32)] bg-[rgba(159,24,32,0.08)] text-[color:var(--lp-red-deep)]"
                          : "border-[color:var(--lp-line)] bg-[rgba(255,251,246,0.9)] text-[color:var(--lp-muted-strong)] hover:border-[rgba(125,15,19,0.18)] hover:bg-white"
                      }`}
                      key={targetId}
                      onClick={() => setActiveLabel90Target(targetId)}
                      type="button"
                    >
                      {target.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

async function extractResponseError(response: Response, fallback: string) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await response.json()) as { error?: { message?: string } };
    return body.error?.message ?? fallback;
  }

  const text = await response.text();
  return text || fallback;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-600">{message}</p>;
}

function NumberInput({
  controlLabel,
  form,
  registerPath,
  step = "0.1"
}: {
  controlLabel: string;
  form: ReturnType<typeof useForm<LabelProjectPayload>>;
  registerPath: string;
  step?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{controlLabel}</span>
      <input
        className="lp-input"
        step={step}
        type="number"
        {...form.register(registerPath as never, { valueAsNumber: true })}
      />
    </label>
  );
}
