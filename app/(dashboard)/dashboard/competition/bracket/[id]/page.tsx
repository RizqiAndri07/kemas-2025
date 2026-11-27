import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getBracketByCompetitionId,
  getAllBrackets,
  BracketWithCompetition,
} from "@/modules/competition/infrastructure/competition-bracket.repository";
import { getCompetitionById } from "@/modules/competition/infrastructure/competition.repository";
import { BracketDetailView } from "@/modules/competition/presentation/components/bracket/bracket-detail-view";

export const dynamic = "force-dynamic";

interface DedicatedBracketPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: DedicatedBracketPageProps): Promise<Metadata> {
  const { id } = await params;
  const competition = await getCompetitionById(id);

  return {
    title: competition
      ? `Bagan Pertandingan: ${competition.name} - Admin Dashboard`
      : "Bagan Pertandingan - Admin Dashboard",
    description: "Visualisasi dan manajemen bagan pohon turnamen resmi Kemas Prasasti 2025.",
  };
}

export default async function DedicatedBracketPage({ params }: DedicatedBracketPageProps) {
  const { id } = await params;

  // Coba cari data kompetisi dan bagan berdasarkan ID kompetisi
  const [competition, bracketData] = await Promise.all([
    getCompetitionById(id),
    getBracketByCompetitionId(id),
  ]);

  let finalBracket: BracketWithCompetition | null = null;

  if (competition && bracketData) {
    finalBracket = {
      ...bracketData,
      competitionName: competition.name,
      competitionType: competition.type,
      competitionStatus: competition.status,
    };
  } else {
    // Fallback: periksa apakah parameter ID adalah bracket.id dari tabel bagan
    const allBrackets = await getAllBrackets();
    const matched = allBrackets.find((b) => b.id === id || b.competitionId === id);

    if (matched) {
      finalBracket = matched;
    }
  }

  if (!finalBracket) {
    notFound();
  }

  return (
    <div className="py-2">
      <BracketDetailView bracket={finalBracket} />
    </div>
  );
}
