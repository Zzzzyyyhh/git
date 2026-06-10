import Link from "next/link";
import { notFound } from "next/navigation";

import { LabelPreview } from "@/components/LabelPreview";
import { OverflowWarning } from "@/components/OverflowWarning";
import { deserializeLabelData } from "@/lib/labelDataStore";
import { prisma } from "@/lib/prisma";

export default async function PreviewLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.labelProject.findUnique({ where: { id } });

  if (!project) {
    notFound();
  }

  const data = deserializeLabelData(project.data);

  return (
    <div className="space-y-4">
      <div className="lp-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="lp-kicker">Preview Workspace</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{project.name}</h2>
            <p className="mt-2 text-sm text-[color:var(--lp-muted-strong)]">在独立预览页核对标签内容、版式与导出前状态。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="lp-btn-secondary px-4 py-2 text-sm" href="/labels">
              返回列表
            </Link>
            <Link className="lp-btn-primary px-4 py-2 text-sm" href={`/labels/${project.id}/edit`}>
              返回编辑
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <InfoCard label="项目 ID" value={project.id} />
          <InfoCard label="模板版本" value={project.templateKey} />
          <InfoCard label="页面用途" value="预览 / 导出校对" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)] xl:items-start">
        <div className="lp-card p-4 sm:p-5">
          <p className="lp-kicker">Preview Notes</p>
          <h3 className="mt-2 text-lg font-semibold">校对重点</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--lp-muted-strong)]">
            <li>确认商标、净含量与标题信息是否完整。</li>
            <li>核对详情文字与营养成分表是否溢出或重叠。</li>
            <li>导出前确认模板版本与内容对应无误。</li>
          </ul>
        </div>

        <div className="space-y-4">
          <OverflowWarning data={data} />
          <LabelPreview data={data} templateKey={project.templateKey} />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="lp-panel px-4 py-4">
      <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--lp-muted)]">{label}</div>
      <div className="mt-3 break-all text-sm font-medium text-[color:var(--lp-ink)]">{value}</div>
    </div>
  );
}
