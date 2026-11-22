import { Calendar, Clock } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { getAllCompetitions } from "@/modules/competition/infrastructure/competition.repository";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rundown Acara - Admin Dashboard",
  description: "Kelola susunan agenda dan jadwal waktu pelaksanaan kegiatan",
};

export default async function RundownPage() {
  const competitions = await getAllCompetitions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rundown & Susunan Acara"
        description="Kelola timeline pelaksanaan kegiatan, alur agenda waktu per sesi, dan lokasi stage/court untuk tiap kompetisi."
      />

      <Card className="border-border">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Clock className="h-7 w-7" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="font-heading font-bold text-lg text-foreground">
              Susunan Acara & Rundown Timeline
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Modul ini akan memfasilitasi panitia dalam mengatur jadwal acara menit-demi-menit untuk {competitions.length} kompetisi/event yang terdaftar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
