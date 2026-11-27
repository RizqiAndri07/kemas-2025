import { notFound } from "next/navigation";
import { getCompetitionById } from "@/modules/competition/infrastructure/competition.repository";
import { getContactPersonsByCompetitionId } from "@/modules/competition/infrastructure/contact-person.repository";
import { getDocumentsByCompetitionId } from "@/modules/competition/infrastructure/event-document.repository";
import { getFormsByCompetitionId } from "@/modules/competition/infrastructure/competition-form.repository";
import { getRundownByCompetitionId } from "@/modules/competition/infrastructure/competition-rundown.repository";
import { getBracketByCompetitionId } from "@/modules/competition/infrastructure/competition-bracket.repository";
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

  const [contactPersons, documents, forms, rundown, bracket] = await Promise.all([
    getContactPersonsByCompetitionId(id),
    getDocumentsByCompetitionId(id),
    getFormsByCompetitionId(id),
    getRundownByCompetitionId(id),
    getBracketByCompetitionId(id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${competition.name}`}
        description="Perbarui jadwal pendaftaran, tanggal pelaksanaan kegiatan, biaya, atau status operasional kompetisi."
      />
      <CompetitionForm
        initialData={competition}
        initialContactPersonIds={contactPersons.map((cp) => cp.id)}
        initialDocuments={documents.map((d) => ({
          id: d.id,
          name: d.name,
          filePath: d.filePath,
        }))}
        initialAvailableForms={forms}
        initialRundown={rundown}
        initialBracket={bracket}
      />
    </div>
  );
}
