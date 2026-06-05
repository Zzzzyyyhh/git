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

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-black/10 bg-white/90 p-6 shadow-panel">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-black/45">Project Dashboard</p>
            <h2 className="text-2xl font-semibold">标签项目列表 / Label Projects</h2>
            <p className="mt-2 max-w-3xl text-sm text-black/60">
              支持搜索、模板筛选、状态筛选、复制、归档和删除，适合高频维护多个白标项目。
            </p>
          </div>
          <Link className="rounded-full bg-ink px-5 py-3 text-sm text-white hover:bg-black" href="/labels/new">
            新建标签项目 / New Project
          </Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-black/10 bg-white/90 p-5 shadow-panel">
        <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px_auto]" method="get">
          <label className="space-y-2">
            <span className="text-sm font-medium">搜索项目 / Search</span>
            <input
              className="w-full rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3 outline-none transition focus:border-black"
              defaultValue={q}
              name="q"
              placeholder="项目名或 ID"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">模板筛选 / Template</span>
            <select
              className="w-full rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3 outline-none transition focus:border-black"
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
              className="w-full rounded-2xl border border-black/10 bg-[#faf8f3] px-4 py-3 outline-none transition focus:border-black"
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
            <button className="rounded-full bg-ink px-5 py-3 text-sm text-white hover:bg-black" type="submit">
              搜索
            </button>
            <Link className="rounded-full border border-black/10 px-5 py-3 text-sm hover:bg-black hover:text-white" href="/labels">
              重置
            </Link>
          </div>
        </form>

        <div className="mt-4 text-sm text-black/55">当前结果 {projects.length} 条</div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-black/10 bg-white/90 shadow-panel">
        <table className="min-w-full divide-y divide-black/10 text-sm">
          <thead className="bg-[#f8f5ed] text-left text-black/55">
            <tr>
              <th className="px-5 py-4 font-medium">项目 / Project</th>
              <th className="px-5 py-4 font-medium">模板 / Template</th>
              <th className="px-5 py-4 font-medium">状态 / Status</th>
              <th className="px-5 py-4 font-medium">更新时间 / Updated</th>
              <th className="px-5 py-4 font-medium">操作 / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {projects.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-black/55" colSpan={5}>
                  没有匹配的标签项目，请调整搜索条件。 / No matching label projects.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-5 py-4">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-xs text-black/45">{project.id}</div>
                  </td>
                  <td className="px-5 py-4">{getTemplateMeta(project.templateKey).name}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full border border-black/10 px-3 py-1 text-xs uppercase tracking-[0.16em]">
                      {project.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-black/60">{dateFormatter.format(project.updatedAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link className="rounded-full border border-black/10 px-3 py-1.5 hover:bg-black hover:text-white" href={`/labels/${project.id}/edit`}>
                        编辑 / Edit
                      </Link>
                      <Link className="rounded-full border border-black/10 px-3 py-1.5 hover:bg-black hover:text-white" href={`/labels/${project.id}/preview`}>
                        预览 / Preview
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
