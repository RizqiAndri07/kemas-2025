import { apiClient } from "@/lib/api-client";
import {
  CompetitionBracketSelect,
  CompetitionBracketInsert,
} from "./competition-bracket.table";

export interface BracketWithCompetition extends CompetitionBracketSelect {
  competitionName: string;
  competitionType: string;
  competitionStatus: string;
}

export interface VerifiedParticipant {
  id: string;
  registrationNumber: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt?: string | Date;
}

export async function getAllBrackets(): Promise<BracketWithCompetition[]> {
  const res = await apiClient<BracketWithCompetition[]>("competitions/brackets/all");
  return res.data || [];
}

export async function getVerifiedParticipants(competitionId: string): Promise<VerifiedParticipant[]> {
  const res = await apiClient<VerifiedParticipant[]>(`competitions/${competitionId}/verified-participants`);
  return res.data || [];
}


export async function getBracketByCompetitionId(
  competitionId: string
): Promise<CompetitionBracketSelect | null> {
  const res = await apiClient<CompetitionBracketSelect>(`competitions/${competitionId}/bracket`);
  return res.data || null;
}

export async function saveBracket(
  competitionId: string,
  data: Partial<CompetitionBracketInsert>
): Promise<CompetitionBracketSelect | null> {
  const res = await apiClient<CompetitionBracketSelect>(`competitions/${competitionId}/bracket`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data || null;
}

export async function deleteBracket(competitionId: string): Promise<boolean> {
  const res = await apiClient(`competitions/${competitionId}/bracket`, {
    method: "DELETE",
  });
  return res.success;
}
