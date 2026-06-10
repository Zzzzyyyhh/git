import Link from "next/link";

import { 项目操作01 } from "@/components/项目操作01";
import { getTemplateMeta, templateCatalog, templateKeys } from "@/lib/templateCatalog";
import { prisma } from "@/lib/prisma";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
  timeStyle: "short"
});

type LabelsPageProps = {
  searchParams?: Promise<{
    q?: string;
    template?: string;
    status?: string;
  }>;
};

export default async function LabelsPage({ searchParams }: LabelsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const q = resolvedSearchParams.q?.trim() ?? "";
  const template = resolvedSearchParams.template?.trim() ?? "";
  const status = resolvedSearchParams.status?.trim() ?? "";

  const projects = await prisma.labelProject.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { id: { contains: q } }
            ]
          }
        : {}),
      ...(template ? { templateKey: template } : {}),
      ...(status ? { status } : {})
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  const draftCount = projects.filter((project) => project.status === "draft").length;
  const archivedCount = projects.filter((project) => project.status === "archived").length;
  const activeCount = projects.length - archivedCount;

  return (
    <div className="space-y-5">
      <section className="lp-card p-6 sm:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="lp-kicker">Project Dashboard</p>
            <h2 className="mt-2 text-[clamp(1.7rem,3vw,2.4rem)] font-semibold tracking-[-0.03em]">标签项目列表</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--lp-muted-strong)]">
              统一管理标签项目、模板状态与导出节点。主列表强调快速搜索、明确状态和高频操作的可达性。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="项目总数" value={String(projects.length).padStart(2, "0")} />
            <MetricCard label="进行中" value={String(activeCount).padStart(2, "0")} />
            <MetricCard label="草稿数" value={String(draftCount).padStart(2, "0")} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link className="lp-btn-primary px-5 py-3 text-sm font-medium" href="/labels/new">
            新建标签项目
          </Link>
          <span className="rounded-full border border-[color:var(--lp-line)] bg-white/60 px-4 py-2 text-sm text-[color:var(--lp-muted-strong)]">
            已归档 {archivedCount} 个项目
          </span>
        </div>
      </section>

      <section className="lp-card p-5">
        <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px_auto]" method="get">
          <label className="space-y-2">
            <span className="text-sm font-medium">搜索项目 / Search</span>
            <input
              className="lp-input"
              defaultValue={q}
              name="q"
              placeholder="项目名或 ID"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">模板筛选 / Template</span>
            <select
              className="lp-input"
              defaultValue={template}
              name="template"
            >
              <option value="">全部模板</option>
              {templateKeys.map((key) => (
                <option key={key} value={key}>
                  {templateCatalog[key].name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">状态筛选 / Status</span>
            <select
              className="lp-input"
              defaultValue={status}
              name="status"
            >
              <option value="">全部状态</option>
              <option value="draft">draft</option>
              <option value="reviewing">reviewing</option>
              <option value="approved">approved</option>
              <option value="archived">archived</option>
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button className="lp-btn-primary px-5 py-3 text-sm" type="submit">
              搜索
            </button>
            <Link className="lp-btn-secondary px-5 py-3 text-sm" href="/labels">
              重置
            </Link>
          </div>
        </form>

        <div className="mt-4 text-sm text-[color:var(--lp-muted)]">当前结果 {projects.length} 条</div>
      </section>

      <section className="lp-card overflow-hidden">
        <table className="min-w-full divide-y divide-[color:var(--lp-line)] text-sm">
          <thead className="bg-[rgba(208,174,102,0.09)] text-left text-[color:var(--lp-muted)]">
            <tr>
              <th className="px-5 py-4 font-medium">项目 / Project</th>
              <th className="px-5 py-4 font-medium">模板 / Template</th>
              <th className="px-5 py-4 font-medium">状态 / Status</th>
              <th className="px-5 py-4 font-medium">更新时间 / Updated</th>
              <th className="px-5 py-4 font-medium">操作 / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(80,49,28,0.06)]">
            {projects.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-[color:var(--lp-muted)]" colSpan={5}>
                  没有匹配的标签项目，请调整搜索条件。 / No matching label projects.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr className="bg-white/52 transition hover:bg-white/82" key={project.id}>
                  <td className="px-5 py-4">
                    <div className="font-medium text-[color:var(--lp-ink)]">{project.name}</div>
                    <div className="text-xs text-[color:var(--lp-muted)]">{project.id}</div>
                  </td>
                  <td className="px-5 py-4">{getTemplateMeta(project.templateKey).name}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full border border-[color:var(--lp-line)] bg-white/72 px-3 py-1 text-xs uppercase tracking-[0.16em] text-[color:var(--lp-red-deep)]">
                      {project.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[color:var(--lp-muted-strong)]">{dateFormatter.format(project.updatedAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link className="lp-btn-secondary px-3 py-1.5" href={`/labels/${project.id}/edit`}>
                        编辑
                      </Link>
                      <Link className="lp-btn-secondary px-3 py-1.5" href={`/labels/${project.id}/preview`}>
                        预览
                      </Link>
                      <项目操作01 id={project.id} isArchived={project.status === "archived"} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="lp-panel px-4 py-4">
      <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--lp-muted)]">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[color:var(--lp-red-deep)]">{value}</div>
    </div>
  );
}
