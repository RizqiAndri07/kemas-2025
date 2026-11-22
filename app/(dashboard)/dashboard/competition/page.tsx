import { getAllCompetitions } from "@/modules/competition/infrastructure/competition.repository";
import { CompetitionStats } from "@/modules/competition/presentation/components/competition-stats";
import { CompetitionGrid } from "@/modules/competition/presentation/components/competition-grid";
import { PageHeader } from "@/components/dashboard/PageHeader";

export const dynamic = "force-dynamic";

export default async function CompetitionPage() {
  const competitions = await getAllCompetitions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Kompetisi & Event"
        description="Kelola cabang lomba, turnamen olahraga/e-sport, jadwal registrasi, waktu pelaksanaan acara, dan biaya pendaftaran."
      />

      {/* Summary Stat Cards */}
      <CompetitionStats competitions={competitions} />

      {/* Grid of Cards (includes AddCompetitionCard as the first item) */}
      <CompetitionGrid competitions={competitions} />
    </div>
  );
}
