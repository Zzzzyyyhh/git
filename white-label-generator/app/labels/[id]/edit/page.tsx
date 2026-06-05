import { notFound } from "next/navigation";

import { LabelForm } from "@/components/LabelForm";
import { deserializeLabelData } from "@/lib/labelDataStore";
import { prisma } from "@/lib/prisma";
import { labelStatusSchema, templateKeySchema } from "@/lib/labelSchema";

export default async function EditLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.labelProject.findUnique({ where: { id } });

  if (!project) {
    notFound();
  }

  return (
    <LabelForm
      initialValue={{
        id: project.id,
        name: project.name,
        templateKey: templateKeySchema.parse(project.templateKey),
        status: labelStatusSchema.parse(project.status),
        data: deserializeLabelData(project.data)
      }}
      mode="edit"
    />
  );
}
