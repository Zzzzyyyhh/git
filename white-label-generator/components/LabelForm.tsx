"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
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
  labelSchema,
  labelProjectSchema,
  labelStatusSchema,
  type Label12095DetailKey,
  type Label12095Layout,
  type Label90DetailKey,
  type Label90Layout,
  type LabelProjectPayload
} from "@/lib/labelSchema";
import { templates } from "@/lib/templates";

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
const chineseLabelTemplateKeys = new Set<LabelProjectPayload["templateKey"]>(["label_90x120_cn", "label_120x95_cn"]);
const draggableChineseTemplateKeys = new Set<LabelProjectPayload["templateKey"]>(["label_90x120_cn", "label_120x95_cn"]);

export function LabelForm({ mode, initialValue, templateDefaults = {} }: LabelFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [exporting, setExporting] = useState<null | "pdf" | "png">(null);
  const [savingTemplateDefault, setSavingTemplateDefault] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [savingPreset, setSavingPreset] = useState(false);
  const [showLoadPreset, setShowLoadPreset] = useState(false);
  const [presets, setPresets] = useState<Array<{ id: string; name: string; templateKey: string; createdAt: string }>>([]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null);
  const [activeLabel90Target, setActiveLabel90Target] = useState<string | null>(null);
  const form = useForm<LabelProjectPayload>({
    resolver: zodResolver(labelProjectSchema),
    defaultValues: initialValue ?? createDefaultProjectPayload()
  });

  // 拖拽状态
  const [drag90Key, setDrag90Key] = useState<string | null>(null);
  const [drag12095Key, setDrag12095Key] = useState<string | null>(null);
  // 自动排版行间距（mm）
  const [autoLayoutGap, setAutoLayoutGap] = useState(0.3);

  // 90x120 详情字段文本估算（标签 + 值）
  function getDetail90Text(data: LabelProjectPayload["data"], key: Label90DetailKey): string {
    const labels: Record<string, string> = {
      formalName: "产品名称：", ingredients: "配料表：", allergen: "致敏物质提示：",
      license: "食品生产许可证编号：", storage: "贮存条件：", date: "生产日期及保质期到期日：",
      consignor: "委托商：", consignorAddress: "委托商地址：", consignorTel: "委托商电话：",
      manufacturer: "受委托商：", manufacturerAddress: "地址：", manufacturerTel: "电话：",
      countryOfOrigin: "产地：", standardCode: "产品执行标准：",
      usageMethod: "食用方法：", shelfLife: "保质期：", customRows: ""
    };
    if (key === "customRows") return data.customRows.map((r: { label: string; value: string }) => `${r.label}：${r.value}`).join("\n");
    const valMap: Record<string, string> = {
      formalName: data.productFormalNameCn, ingredients: data.ingredients,
      allergen: data.allergenDeclaration, license: data.productionLicenseNumber,
      storage: data.storageCondition, date: data.productionDateAndLotNumber || data.expiryDate,
      consignor: data.consignor, consignorAddress: data.consignorAddress,
      consignorTel: data.consignorTel, manufacturer: data.manufacturer,
      manufacturerAddress: data.manufacturerAddress, manufacturerTel: data.manufacturerTel,
      countryOfOrigin: data.countryOfOrigin, standardCode: data.productStandardCode,
      usageMethod: data.usageMethod, shelfLife: data.shelfLife
    };
    return (labels[key] || "") + (valMap[key] || "");
  }

  // 120x95 详情字段文本估算
  function getDetail12095Text(data: LabelProjectPayload["data"], key: Label12095DetailKey): string {
    const labels: Record<string, string> = {
      formalName: "产品名称：", ingredients: "配料表：", allergen: "致敏物质提示：",
      license: "食品生产许可证编号：", standardCode: "产品执行标准：", storage: "贮存条件：",
      shelfLife: "保质期：", date: "生产日期及保质期到期日：", usageMethod: "食用方法：",
      consignor: "委托商：", consignorAddress: "委托商地址：", consignorTel: "委托商电话：",
      manufacturer: "生产者名称：", countryOfOrigin: "产地：",
      manufacturerTel: "电话：", manufacturerAddress: "地址：", website: "官网："
    };
    const valMap: Record<string, string> = {
      formalName: data.productFormalNameCn, ingredients: data.ingredients,
      allergen: data.allergenDeclaration, license: data.productionLicenseNumber,
      standardCode: data.productStandardCode, storage: data.storageCondition,
      shelfLife: data.shelfLife, date: data.productionDateAndLotNumber || data.expiryDate,
      usageMethod: data.usageMethod, consignor: data.consignor,
      consignorAddress: data.consignorAddress, consignorTel: data.consignorTel,
      manufacturer: data.manufacturer, countryOfOrigin: data.countryOfOrigin,
      manufacturerTel: data.manufacturerTel, manufacturerAddress: data.manufacturerAddress,
      website: "www.longpai-food.com"
    };
    return (labels[key] || "") + (valMap[key] || "");
  }

  // 自动排版：先按预览中的 y 坐标排序，再用 DOM 实测高度从上到下依次堆叠
  const handleAutoLayout90 = useCallback(() => {
    const data = form.getValues("data");
    const order = data.label90DetailOrder;
    const hidden = data.label90HiddenDetails;

    const visible = order.filter((k: Label90DetailKey) => !hidden.includes(k) && k !== "customRows");
    if (visible.length === 0) return;

    const sortedByY = [...visible].sort(
      (a, b) => data.label90DetailBoxes[a].y - data.label90DetailBoxes[b].y
    );

    // 获取 mm→px 换算比例
    const rulerEl = document.createElement("div");
    rulerEl.style.cssText = "position:absolute;visibility:hidden;width:10mm;height:0;top:-9999px;left:-9999px";
    document.body.appendChild(rulerEl);
    const pxPerMm = rulerEl.getBoundingClientRect().width / 10;
    document.body.removeChild(rulerEl);

    // 创建复用测量容器（与详情文本框相同的 CSS）
    const measurer = document.createElement("div");
    measurer.style.cssText = [
      "position:absolute", "visibility:hidden", "pointer-events:none",
      "top:-9999px", "left:-9999px",
      'font-family:"Source Han Sans CN","思源黑体","Source Han Sans SC","Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif',
      "font-size:2.5mm", "line-height:2.5mm",
      "white-space:pre-wrap", "word-break:break-word", "overflow-wrap:anywhere",
      "box-sizing:border-box", "font-weight:800"
    ].join(";");
    document.body.appendChild(measurer);

    const startY = data.label90DetailBoxes[sortedByY[0]].y;
    let y = startY;
    const newBoxes = { ...data.label90DetailBoxes };

    for (const key of sortedByY) {
      const box = data.label90DetailBoxes[key as keyof typeof data.label90DetailBoxes];
      const text = getDetail90Text(data, key as Label90DetailKey);
      measurer.style.width = `${box.width}mm`;
      measurer.textContent = text;
      // scaleY(1.136) 是模板中文字的纵向拉伸系数，需计入视觉高度
      const heightMm = pxPerMm > 0
        ? Math.max(2.5, parseFloat(((measurer.scrollHeight / pxPerMm) * 1.136 + 0.5).toFixed(2)))
        : Math.max(2.5, box.height);
      newBoxes[key as keyof typeof newBoxes] = { ...box, y: parseFloat(y.toFixed(2)), height: heightMm };
      y += heightMm + autoLayoutGap;
    }

    document.body.removeChild(measurer);

    const newOrder = [
      ...sortedByY,
      ...order.filter((k: Label90DetailKey) => !sortedByY.includes(k))
    ] as Label90DetailKey[];

    form.setValue("data.label90DetailBoxes", newBoxes, { shouldDirty: true });
    form.setValue("data.label90DetailOrder", newOrder, { shouldDirty: true });
  }, [form, autoLayoutGap]);

  const handleAutoLayout12095 = useCallback(() => {
    const data = form.getValues("data");
    const order = data.label12095DetailOrder;
    const hidden = data.label12095HiddenDetails;

    const visible = order.filter((k: Label12095DetailKey) => !hidden.includes(k));
    if (visible.length === 0) return;

    const sortedByY = [...visible].sort(
      (a, b) => data.label12095DetailBoxes[a].y - data.label12095DetailBoxes[b].y
    );

    // 获取 mm→px 换算比例
    const rulerEl = document.createElement("div");
    rulerEl.style.cssText = "position:absolute;visibility:hidden;width:10mm;height:0;top:-9999px;left:-9999px";
    document.body.appendChild(rulerEl);
    const pxPerMm = rulerEl.getBoundingClientRect().width / 10;
    document.body.removeChild(rulerEl);

    // 创建复用测量容器（与详情文本框相同的 CSS）
    const measurer = document.createElement("div");
    measurer.style.cssText = [
      "position:absolute", "visibility:hidden", "pointer-events:none",
      "top:-9999px", "left:-9999px",
      'font-family:"Source Han Sans CN","思源黑体","Source Han Sans SC","Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif',
      "font-size:2.5mm", "line-height:2.5mm",
      "white-space:pre-wrap", "word-break:break-word", "overflow-wrap:anywhere",
      "box-sizing:border-box", "font-weight:800"
    ].join(";");
    document.body.appendChild(measurer);

    const startY = data.label12095DetailBoxes[sortedByY[0]].y;
    let y = startY;
    const newBoxes = { ...data.label12095DetailBoxes };

    for (const key of sortedByY) {
      const box = data.label12095DetailBoxes[key as keyof typeof data.label12095DetailBoxes];
      const text = getDetail12095Text(data, key as Label12095DetailKey);
      measurer.style.width = `${box.width}mm`;
      measurer.textContent = text;
      const heightMm = pxPerMm > 0
        ? Math.max(2.5, parseFloat(((measurer.scrollHeight / pxPerMm) * 1.136 + 0.5).toFixed(2)))
        : Math.max(2.5, box.height);
      newBoxes[key as keyof typeof newBoxes] = { ...box, y: parseFloat(y.toFixed(2)), height: heightMm };
      y += heightMm + autoLayoutGap;
    }

    document.body.removeChild(measurer);

    const newOrder = [
      ...sortedByY,
      ...order.filter((k: Label12095DetailKey) => !sortedByY.includes(k))
    ] as Label12095DetailKey[];

    form.setValue("data.label12095DetailBoxes", newBoxes, { shouldDirty: true });
    form.setValue("data.label12095DetailOrder", newOrder, { shouldDirty: true });
  }, [form, autoLayoutGap]);

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

  async function handleSavePreset() {
    if (!presetName.trim()) return;
    setSavingPreset(true);
    setActionError(null);
    try {
      const response = await fetch("/api/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: presetName.trim(), templateKey: form.getValues("templateKey"), data: form.getValues("data") })
      });
      if (!response.ok) throw new Error(await extractResponseError(response, "保存示例失败"));
      setActionNotice(`示例 "${presetName.trim()}" 已保存。`);
      setShowSavePreset(false);
      setPresetName("");
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setSavingPreset(false);
    }
  }

  async function handleOpenLoadPreset() {
    setShowLoadPreset(true);
    setLoadingPresets(true);
    try {
      const response = await fetch("/api/presets");
      if (!response.ok) throw new Error("加载示例列表失败");
      const data = await response.json();
      setPresets(Array.isArray(data) ? data : []);
    } catch (error) {
      setActionError(getErrorMessage(error));
      setShowLoadPreset(false);
    } finally {
      setLoadingPresets(false);
    }
  }

  async function handleLoadPreset(presetId: string) {
    try {
      const response = await fetch(`/api/presets/${presetId}`);
      if (!response.ok) throw new Error("载入示例失败");
      const preset = await response.json();
      form.setValue("templateKey", preset.templateKey as LabelProjectPayload["templateKey"]);
      form.setValue("data", labelSchema.parse(preset.data), { shouldDirty: true });
      setShowLoadPreset(false);
      setActionNotice(`示例 "${preset.name}" 已载入。`);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  async function handleDeletePreset(presetId: string) {
    setDeletingPresetId(presetId);
    try {
      const response = await fetch(`/api/presets/${presetId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("删除示例失败");
      setPresets((prev) => prev.filter((p) => p.id !== presetId));
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setDeletingPresetId(null);
    }
  }

  return (
    <>
    <div className="grid gap-6 xl:grid-cols-[1fr_minmax(0,580px)] xl:items-start">
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
              className="lp-btn-secondary px-4 py-2 text-sm"
              onClick={() => { setShowSavePreset((v) => !v); setPresetName(""); }}
              type="button"
            >
              保存为示例
            </button>
            <button
              className="lp-btn-secondary px-4 py-2 text-sm"
              onClick={handleOpenLoadPreset}
              type="button"
            >
              载入示例
            </button>
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

          {showSavePreset ? (
            <div className="rounded-2xl border border-[color:var(--lp-line)] bg-[color:var(--lp-surface)] px-4 py-3">
              <p className="mb-2 text-sm font-medium">保存为示例</p>
              <div className="flex gap-2">
                <input
                  autoFocus
                  className="lp-input flex-1 text-sm"
                  maxLength={60}
                  onChange={(e) => setPresetName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSavePreset(); } if (e.key === "Escape") setShowSavePreset(false); }}
                  placeholder="示例名称（最多 60 字）"
                  value={presetName}
                />
                <button
                  className="lp-btn-primary px-4 py-2 text-sm disabled:opacity-50"
                  disabled={savingPreset || !presetName.trim()}
                  onClick={handleSavePreset}
                  type="button"
                >
                  {savingPreset ? "保存中…" : "保存"}
                </button>
                <button
                  className="lp-btn-secondary px-4 py-2 text-sm"
                  onClick={() => setShowSavePreset(false)}
                  type="button"
                >
                  取消
                </button>
              </div>
            </div>
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
                  <p className="mt-1 text-sm text-[color:var(--lp-muted-strong)]">拖拽左侧 ⠿ 手柄调整字段顺序；一键自动排版按钮在预览图上方。</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <NumberInput controlLabel="详情统一字号(pt)" registerPath="data.label90DetailFontSizePt" form={form} step="0.1" />
                  <NumberInput controlLabel="详情统一行高" registerPath="data.label90DetailLineHeight" form={form} step="0.01" />
                </div>

                <div className="space-y-2">
                  {form.watch("data.label90DetailOrder").map((detailKey) => {
                    const hidden = form.watch("data.label90HiddenDetails").includes(detailKey);
                    const isDragging = drag90Key === detailKey;

                    return (
                      <div
                        key={detailKey}
                        draggable
                        onDragStart={() => setDrag90Key(detailKey)}
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDrop={() => {
                          if (!drag90Key || drag90Key === detailKey) return;
                          const order = form.getValues("data.label90DetailOrder");
                          const from = order.indexOf(drag90Key as Label90DetailKey);
                          const to = order.indexOf(detailKey);
                          if (from === -1 || to === -1) return;
                          const next = [...order];
                          next.splice(from, 1);
                          next.splice(to, 0, drag90Key as Label90DetailKey);
                          form.setValue("data.label90DetailOrder", next, { shouldDirty: true });
                          setDrag90Key(null);
                        }}
                        onDragEnd={() => setDrag90Key(null)}
                        className={`lp-panel bg-white/72 p-3 cursor-default transition-opacity ${isDragging ? "opacity-40" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="cursor-grab text-[color:var(--lp-muted)] select-none text-base leading-none" title="拖拽排序">⠿</span>
                          <label className="flex items-center gap-2 text-sm font-semibold flex-1 cursor-pointer">
                            <input
                              checked={!hidden}
                              onChange={(event) => {
                                const current = form.getValues("data.label90HiddenDetails");
                                if (event.target.checked) {
                                  form.setValue("data.label90HiddenDetails", current.filter((item) => item !== detailKey), { shouldDirty: true });
                                } else if (!current.includes(detailKey)) {
                                  form.setValue("data.label90HiddenDetails", [...current, detailKey], { shouldDirty: true });
                                }
                              }}
                              type="checkbox"
                            />
                            <span className={hidden ? "text-[color:var(--lp-muted)]" : ""}>{detailFieldLabels[detailKey]}</span>
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
                  <p className="mt-1 text-sm text-[color:var(--lp-muted-strong)]">拖拽左侧 ⠿ 手柄调整字段顺序；一键自动排版按钮在预览图上方。</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <NumberInput controlLabel="详情统一字号(pt)" registerPath="data.label12095DetailFontSizePt" form={form} step="0.1" />
                  <NumberInput controlLabel="详情统一行高" registerPath="data.label12095DetailLineHeight" form={form} step="0.01" />
                </div>

                <div className="space-y-2">
                  {form.watch("data.label12095DetailOrder").map((detailKey) => {
                    const hidden = form.watch("data.label12095HiddenDetails").includes(detailKey);
                    const isDragging = drag12095Key === detailKey;

                    return (
                      <div
                        key={detailKey}
                        draggable
                        onDragStart={() => setDrag12095Key(detailKey)}
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDrop={() => {
                          if (!drag12095Key || drag12095Key === detailKey) return;
                          const order = form.getValues("data.label12095DetailOrder");
                          const from = order.indexOf(drag12095Key as Label12095DetailKey);
                          const to = order.indexOf(detailKey);
                          if (from === -1 || to === -1) return;
                          const next = [...order];
                          next.splice(from, 1);
                          next.splice(to, 0, drag12095Key as Label12095DetailKey);
                          form.setValue("data.label12095DetailOrder", next, { shouldDirty: true });
                          setDrag12095Key(null);
                        }}
                        onDragEnd={() => setDrag12095Key(null)}
                        className={`lp-panel bg-white/72 p-3 cursor-default transition-opacity ${isDragging ? "opacity-40" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="cursor-grab text-[color:var(--lp-muted)] select-none text-base leading-none" title="拖拽排序">⠿</span>
                          <label className="flex items-center gap-2 text-sm font-semibold flex-1 cursor-pointer">
                            <input
                              checked={!hidden}
                              onChange={(event) => {
                                const current = form.getValues("data.label12095HiddenDetails");
                                if (event.target.checked) {
                                  form.setValue("data.label12095HiddenDetails", current.filter((item) => item !== detailKey), { shouldDirty: true });
                                } else if (!current.includes(detailKey)) {
                                  form.setValue("data.label12095HiddenDetails", [...current, detailKey], { shouldDirty: true });
                                }
                              }}
                              type="checkbox"
                            />
                            <span className={hidden ? "text-[color:var(--lp-muted)]" : ""}>{detailFieldLabels12095[detailKey]}</span>
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

      <div className="space-y-4 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto xl:py-4">
        <OverflowWarning data={previewValues.data} />
        {draggableChineseTemplateKeys.has(previewValues.templateKey) ? (
          <div className="lp-card flex flex-wrap items-center gap-3 px-4 py-3">
            <label className="flex items-center gap-2 text-sm font-medium whitespace-nowrap">
              行间距
              <input
                className="lp-input w-20 text-sm"
                max="10"
                min="0"
                onChange={(e) => setAutoLayoutGap(parseFloat(e.target.value) || 0)}
                step="0.1"
                type="number"
                value={autoLayoutGap}
              />
              <span className="text-[color:var(--lp-muted)]">mm</span>
            </label>
            <button
              className="lp-btn-primary px-4 py-2 text-sm font-medium"
              onClick={previewValues.templateKey === "label_90x120_cn" ? handleAutoLayout90 : handleAutoLayout12095}
              type="button"
            >
              一键自动排版
            </button>
          </div>
        ) : null}
        <div className="flex flex-col gap-3">
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
            previewScale={previewValues.templateKey === "label_90x120_cn" ? 1.5 : 1.15}
            previewRef={previewRef}
            templateKey={previewValues.templateKey}
          />
          {draggableChineseTemplateKeys.has(previewValues.templateKey) ? (
            <div className="lp-card p-3">
              <div className="flex flex-wrap gap-1.5">
                {previewTextTargets.map((target) => {
                  const targetId = getEditableTargetId(target);
                  const active = activeLabel90Target === targetId;

                  return (
                    <button
                      className={`rounded-xl border px-2.5 py-2 text-xs font-medium transition ${
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

    {/* 载入示例模态框 */}
    {showLoadPreset ? (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={() => setShowLoadPreset(false)}
      >
        <div
          className="lp-card w-full max-w-md p-5 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold">载入示例</h3>
            <button
              className="rounded-lg px-2 py-1 text-sm text-[color:var(--lp-muted-strong)] hover:bg-[color:var(--lp-surface)] hover:text-[color:var(--lp-foreground)]"
              onClick={() => setShowLoadPreset(false)}
              type="button"
            >
              关闭
            </button>
          </div>
          {loadingPresets ? (
            <p className="py-6 text-center text-sm text-[color:var(--lp-muted-strong)]">加载中…</p>
          ) : presets.length === 0 ? (
            <p className="py-6 text-center text-sm text-[color:var(--lp-muted-strong)]">暂无已保存的示例。</p>
          ) : (
            <ul className="max-h-80 divide-y divide-[color:var(--lp-line)] overflow-y-auto">
              {presets.map((preset) => (
                <li className="flex items-center justify-between gap-3 py-3" key={preset.id}>
                  <div>
                    <p className="text-sm font-medium">{preset.name}</p>
                    <p className="text-xs text-[color:var(--lp-muted-strong)]">
                      {Object.values(templates).find((t) => t.key === preset.templateKey)?.name ?? preset.templateKey}
                      {" · "}
                      {new Date(preset.createdAt).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      className="lp-btn-primary px-3 py-1.5 text-xs"
                      onClick={() => handleLoadPreset(preset.id)}
                      type="button"
                    >
                      载入
                    </button>
                    <button
                      className="lp-btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
                      disabled={deletingPresetId === preset.id}
                      onClick={() => handleDeletePreset(preset.id)}
                      type="button"
                    >
                      {deletingPresetId === preset.id ? "删除中…" : "删除"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    ) : null}
    </>
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
