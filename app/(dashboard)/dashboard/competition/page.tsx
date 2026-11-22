import { getAllCompetitions } from "@/modules/competition/infrastructure/competition.repository";
import { getDocumentsGroupedByCompetition } from "@/modules/competition/infrastructure/event-document.repository";
import { EventDocumentSelect } from "@/modules/competition/infrastructure/event-document.table";
import { CompetitionStats } from "@/modules/competition/presentation/components/competition-stats";
import { CompetitionGrid } from "@/modules/competition/presentation/components/competition-grid";
import { PageHeader } from "@/components/dashboard/PageHeader";

export const dynamic = "force-dynamic";

export default async function CompetitionPage() {
  const [competitions, docsGrouped] = await Promise.all([
    getAllCompetitions(),
    getDocumentsGroupedByCompetition(),
  ]);

  const documentsMap: Record<string, EventDocumentSelect[]> = {};
  for (const [compId, docs] of docsGrouped.entries()) {
    documentsMap[compId] = docs;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Event"
        description="Kelola cabang lomba, turnamen olahraga/e-sport, jadwal registrasi, waktu pelaksanaan acara, dan biaya pendaftaran."
      />

      {/* Grid of Cards (includes AddCompetitionCard as the first item) */}
      <CompetitionGrid competitions={competitions} documentsMap={documentsMap} />
    </div>
  );
}
