import { notFound } from "next/navigation";
import { getCompetitionById } from "@/modules/competition/infrastructure/competition.repository";
import { getOrCreateFormByCompetitionId } from "@/modules/competition/infrastructure/competition-form.repository";
import { FormBuilderEditor } from "@/modules/competition/presentation/components/form-builder/form-builder-editor";

export const dynamic = "force-dynamic";

interface FormBuilderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FormBuilderPage({ params }: FormBuilderPageProps) {
  const { id } = await params;

  const competition = await getCompetitionById(id);
  if (!competition) {
    notFound();
  }

  // Relasi 1:1: Langsung ambil atau inisialisasi formulir pendaftaran kompetisi
  const form = await getOrCreateFormByCompetitionId(id);

  return <FormBuilderEditor competition={competition} form={form} />;
}
