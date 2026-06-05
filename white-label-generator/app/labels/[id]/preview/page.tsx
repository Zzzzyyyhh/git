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
      <div className="rounded-[28px] border border-black/10 bg-white/90 p-5 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-black/45">Preview</p>
            <h2 className="text-xl font-semibold">{project.name}</h2>
          </div>
          <Link className="rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-black hover:text-white" href={`/labels/${project.id}/edit`}>
            返回编辑 / Back to Edit
          </Link>
        </div>
      </div>

      <OverflowWarning data={data} />
      <LabelPreview data={data} templateKey={project.templateKey} />
    </div>
  );
}
