import { notFound } from "next/navigation";
import { getCompetitionById } from "@/modules/competition/infrastructure/competition.repository";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CompetitionForm } from "@/modules/competition/presentation/components/competition-form";

export const dynamic = "force-dynamic";

interface EditCompetitionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCompetitionPage({ params }: EditCompetitionPageProps) {
  const { id } = await params;
  const competition = await getCompetitionById(id);

  if (!competition) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${competition.name}`}
        description="Perbarui jadwal pendaftaran, tanggal pelaksanaan kegiatan, biaya, atau status operasional kompetisi."
      />
      <CompetitionForm initialData={competition} />
    </div>
  );
}
