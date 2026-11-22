import { Trophy, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { getAllCompetitions } from "@/modules/competition/infrastructure/competition.repository";
import { CompetitionType } from "@/modules/competition/domain/competition-type.enum";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bagan Pertandingan (Bracket) - Admin Dashboard",
  description: "Kelola bagan tanding turnamen (Challonge, bracket generator, atau gambar bagan)",
};

export default async function BracketPage() {
  const competitions = await getAllCompetitions();
  const tournaments = competitions.filter((c) => c.type === CompetitionType.TOURNAMENT);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bagan Pertandingan (Bracket)"
        description="Kelola skema bagan turnamen, bagan sistem gugur, dan tautan live bracket untuk cabang perlombaan."
      />

      <Card className="border-border">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Trophy className="h-7 w-7" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="font-heading font-bold text-lg text-foreground">
              Manajemen Bracket Pertandingan
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Modul ini akan mendukung integrasi Live Bracket (Challonge embed / gambar skema bagan) khusus untuk cabang kompetisi turnamen (saat ini terdeteksi {tournaments.length} turnamen aktif).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
