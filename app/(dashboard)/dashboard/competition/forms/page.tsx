import { getAllCompetitionForms } from "@/modules/competition/infrastructure/competition-form.repository";
import { getAllCompetitions } from "@/modules/competition/infrastructure/competition.repository";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { GlobalFormsTable } from "@/modules/competition/presentation/components/form-list/global-forms-table";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Formulir Pendaftaran - Admin Dashboard",
  description: "Kelola formulir pendaftaran fleksibel untuk semua kompetisi dan event Kemas Prasasti 2025.",
};

export default async function CompetitionFormsGlobalPage() {
  const [forms, competitions] = await Promise.all([
    getAllCompetitionForms(),
    getAllCompetitions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Formulir Pendaftaran"
        description="Kelola dan buat formulir pendaftaran dinamis untuk semua cabang kompetisi dan event Kemas Prasasti 2025."
      />
      <GlobalFormsTable forms={forms} competitions={competitions} />
    </div>
  );  
}
