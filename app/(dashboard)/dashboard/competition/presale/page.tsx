import { getAllCompetitions } from "@/modules/competition/infrastructure/competition.repository";
import { getPresalesWithCompetition } from "@/modules/competition/infrastructure/competition-presale.repository";
import { PresaleTable } from "@/modules/competition/presentation/components/presale-table";
import { PageHeader } from "@/components/dashboard/PageHeader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manajemen Presale - Admin Dashboard",
  description: "Kelola gelombang pendaftaran, biaya presale, dan kuota khusus per kompetisi",
};

export default async function PresalePage() {
  const [competitions, presales] = await Promise.all([
    getAllCompetitions(),
    getPresalesWithCompetition(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gelombang Pendaftaran (Presale)"
        description="Kelola penetapan harga bertingkat (Early Bird, Presale 1, Regular Wave) berdasarkan jadwal waktu dan kuota slot pendaftar."
      />
      <PresaleTable presales={presales} competitions={competitions} />
    </div>
  );
}
