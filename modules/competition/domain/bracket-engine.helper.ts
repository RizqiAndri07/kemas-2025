import {
  singleElimination,
  doubleElimination,
  reportResult,
  resetResult,
  participantMap,
} from "react-brackets";

export interface BracketParticipantItem {
  id: string;
  name: string;
}

export interface FormattedBracketMatch {
  id: string;
  roundNumber: number;
  roundTitle: string;
  status: "pending" | "ready" | "completed";
  teamA?: {
    id: string;
    name: string;
    score?: number;
    isWinner: boolean;
  };
  teamB?: {
    id: string;
    name: string;
    score?: number;
    isWinner: boolean;
  };
  winnerId?: string | null;
}

export interface FormattedBracketRound {
  title: string;
  roundNumber: number;
  matches: FormattedBracketMatch[];
}

/**
 * Generate bracket stage baru menggunakan react-brackets
 */
export function generateBracketStage(
  participants: BracketParticipantItem[],
  type: string = "SINGLE_ELIMINATION"
) {
  if (participants.length < 2) {
    throw new Error("Minimal harus ada 2 peserta untuk membuat bagan turnamen");
  }

  // Sanitasi format peserta untuk react-brackets
  const sanitizedParticipants = participants.map((p) => ({
    id: String(p.id),
    name: p.name || `Peserta ${p.id}`,
  }));

  if (type === "DOUBLE_ELIMINATION") {
    return doubleElimination(sanitizedParticipants);
  }

  return singleElimination(sanitizedParticipants);
}

/**
 * Update skor match dan otomatis memajukan pemenang ke ronde berikutnya
 */
export function updateMatchScore(
  stage: any,
  matchId: string,
  scores: [number, number]
) {
  if (!stage || !matchId) return stage;
  return reportResult(stage, matchId, { scores });
}

/**
 * Reset skor match tertentu bila ada kesalahan input
 */
export function resetMatch(stage: any, matchId: string) {
  if (!stage || !matchId) return stage;
  return resetResult(stage, matchId);
}

/**
 * Ekstrak struktur ronde dan pertandingan yang mudah dibaca untuk UI Match Scoring
 */
export function extractBracketRounds(stage: any): FormattedBracketRound[] {
  if (!stage || !stage.groups || !stage.groups.length) {
    return [];
  }

  try {
    const pMap = participantMap(stage);
    const mainGroup = stage.groups[0];
    if (!mainGroup || !mainGroup.rounds) return [];

    return mainGroup.rounds.map((r: any, rIdx: number) => {
      const roundTitle =
        r.name ||
        (rIdx === mainGroup.rounds.length - 1
          ? "Grand Final"
          : rIdx === mainGroup.rounds.length - 2
            ? "Semi Final"
            : rIdx === mainGroup.rounds.length - 3
              ? "Perempat Final"
              : `Babak ${rIdx + 1}`);

      const matches: FormattedBracketMatch[] = (r.matches || []).map((m: any) => {
        const slotA = m.slots?.[0];
        const slotB = m.slots?.[1];

        const partA = slotA?.participantId ? pMap.get(slotA.participantId) : null;
        const partB = slotB?.participantId ? pMap.get(slotB.participantId) : null;

        const isWinnerA = m.winner === 0;
        const isWinnerB = m.winner === 1;

        return {
          id: m.id,
          roundNumber: rIdx + 1,
          roundTitle,
          status: m.status || (partA && partB ? "ready" : "pending"),
          teamA: partA
            ? {
                id: slotA.participantId,
                name: partA.name,
                score: slotA.score,
                isWinner: isWinnerA,
              }
            : undefined,
          teamB: partB
            ? {
                id: slotB.participantId,
                name: partB.name,
                score: slotB.score,
                isWinner: isWinnerB,
              }
            : undefined,
          winnerId: isWinnerA
            ? slotA?.participantId
            : isWinnerB
              ? slotB?.participantId
              : null,
        };
      });

      return {
        title: roundTitle,
        roundNumber: rIdx + 1,
        matches,
      };
    });
  } catch (error) {
    console.error("Error extracting bracket rounds:", error);
    return [];
  }
}

/**
 * Helper untuk acak urutan seeding tim
 */
export function shuffleParticipants<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
