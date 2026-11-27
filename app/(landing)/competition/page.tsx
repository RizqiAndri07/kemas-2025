import React from "react";
import HeroSection from "./HeroSection";
import EventCard from "./EventCard";
import { getAllCompetitions } from "@/modules/competition/infrastructure/competition.repository";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kompetisi & Event - PRASASTI 2026",
  description:
    "Daftar kompetisi resmi Kemas Prasasti 2026 UNS Sukoharjo. Turnamen Futsal, MLBB, Acoustic & Dance, Try Out SNBT, dan Prasasti Festival.",
  keywords: [
    "competition",
    "event",
    "prasasti",
    "kemas uns",
    "festival",
    "prasasti 2026",
    "futsal prasasti",
    "tryout prasasti",
    "mlbb prasasti",
    "accoustic prasasti",
    "dance prasasti",
  ],
};

const CompetitionPage = async () => {
  const competitions = await getAllCompetitions();

  return (
    <div className="container mx-auto px-4 py-24 sm:py-28 max-w-7xl space-y-10">
      <HeroSection totalCount={competitions.length} />

      {competitions.length === 0 ? (
        <Card className="max-w-md mx-auto text-center p-8 border-dashed">
          <CardContent className="space-y-3 p-0">
            <Trophy className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-semibold text-foreground">
              Belum Ada Kompetisi
            </h3>
            <p className="text-xs text-muted-foreground">
              Saat ini belum ada data kompetisi aktif yang tersedia di database. Silakan cek kembali nanti.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((comp) => (
            <EventCard key={comp.id} competition={comp} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompetitionPage;