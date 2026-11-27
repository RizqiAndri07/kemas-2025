import { apiClient } from "@/lib/api-client";
import {
  CompetitionRundownSelect,
  CompetitionRundownInsert,
} from "./competition-rundown.table";

export interface RundownWithCompetition extends CompetitionRundownSelect {
  competitionName: string;
  competitionType: string;
  competitionStatus: string;
  eventStartDate: string;
  eventEndDate: string;
}

export async function getAllRundowns(): Promise<RundownWithCompetition[]> {
  const res = await apiClient<RundownWithCompetition[]>("competitions/rundowns/all");
  return res.data || [];
}

export async function getRundownByCompetitionId(
  competitionId: string
): Promise<CompetitionRundownSelect | null> {
  const res = await apiClient<CompetitionRundownSelect>(`competitions/${competitionId}/rundown`);
  return res.data || null;
}

export async function saveRundown(
  competitionId: string,
  data: Partial<CompetitionRundownInsert>
): Promise<CompetitionRundownSelect | null> {
  const res = await apiClient<CompetitionRundownSelect>(`competitions/${competitionId}/rundown`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data || null;
}

export async function deleteRundown(competitionId: string): Promise<boolean> {
  const res = await apiClient(`competitions/${competitionId}/rundown`, {
    method: "DELETE",
  });
  return res.success;
}
