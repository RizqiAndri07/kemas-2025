import { apiClient } from "@/lib/api-client";
import { CompetitionSelect, CompetitionInsert } from "./competition.table";
import { CompetitionStatus } from "../domain/competition-status.enum";

export async function getAllCompetitions(): Promise<CompetitionSelect[]> {
  const res = await apiClient<CompetitionSelect[]>("competitions");
  return res.data || [];
}

export async function getCompetitionById(id: string): Promise<CompetitionSelect | null> {
  const res = await apiClient<CompetitionSelect>(`competitions/${id}`);
  return res.data || null;
}

export async function createCompetition(data: CompetitionInsert): Promise<CompetitionSelect> {
  const res = await apiClient<CompetitionSelect>("competitions", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data!;
}

export async function updateCompetition(
  id: string,
  data: Partial<CompetitionInsert>
): Promise<CompetitionSelect | null> {
  const res = await apiClient<CompetitionSelect>(`competitions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data || null;
}

export async function deleteCompetition(id: string): Promise<boolean> {
  const res = await apiClient(`competitions/${id}`, {
    method: "DELETE",
  });
  return res.success;
}

export async function toggleCompetitionStatus(
  id: string,
  newStatus: CompetitionStatus
): Promise<CompetitionSelect | null> {
  const res = await apiClient<CompetitionSelect>(`competitions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: newStatus }),
  });
  return res.data || null;
}

export async function setActiveForm(
  competitionId: string,
  formId: string | null
): Promise<CompetitionSelect | null> {
  if (!formId) return null;
  const res = await apiClient<CompetitionSelect>(`competitions/${competitionId}/forms/${formId}/activate`, {
    method: "PATCH",
  });
  return res.data || null;
}
