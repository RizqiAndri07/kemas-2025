import { PageHeader } from "@/components/dashboard/PageHeader";
import { CompetitionForm } from "@/modules/competition/presentation/components/competition-form";

export const metadata = {
  title: "Tambah Kompetisi Baru - Admin Dashboard",
  description: "Formulir pendaftaran cabang lomba atau turnamen baru Kemas Prasasti 2025",
};

export default function CreateCompetitionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Kompetisi / Event Baru"
        description="Buka pendaftaran cabang lomba, turnamen, atau agenda kegiatan baru pada platform Kemas Prasasti 2025."
      />
      <CompetitionForm />
    </div>
  );
}
