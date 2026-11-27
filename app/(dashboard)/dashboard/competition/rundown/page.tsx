import { PageHeader } from "@/components/dashboard/PageHeader";
import { getAllRundowns } from "@/modules/competition/infrastructure/competition-rundown.repository";
import { RundownTable } from "@/modules/competition/presentation/components/rundown/rundown-table";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rundown Acara - Admin Dashboard",
  description: "Kelola susunan agenda dan jadwal waktu pelaksanaan kegiatan",
};

export default async function RundownPage() {
  const rundowns = await getAllRundowns();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rundown & Susunan Acara"
        description="Kelola timeline pelaksanaan kegiatan, alur agenda waktu per sesi, dan lokasi stage/court untuk tiap kompetisi."
      />

      <RundownTable initialRundowns={rundowns} />
    </div>
  );
}
