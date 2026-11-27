import { PageHeader } from "@/components/dashboard/PageHeader";
import { getAllBrackets } from "@/modules/competition/infrastructure/competition-bracket.repository";
import { BracketCardGrid } from "@/modules/competition/presentation/components/bracket/bracket-card-grid";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bagan Pertandingan (Bracket) - Admin Dashboard",
  description: "Kelola bagan tanding turnamen (Challonge, bracket generator, atau gambar bagan)",
};

export default async function BracketPage() {
  const brackets = await getAllBrackets();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bagan Pertandingan (Bracket)"
        description="Kelola skema bagan turnamen, bagan sistem gugur, dan tautan live bracket untuk cabang perlombaan."
      />

      <BracketCardGrid initialBrackets={brackets} />
    </div>
  );
}

