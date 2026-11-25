import { apiClient } from "@/lib/api-client";
import {
  CompetitionFormSelect,
  CompetitionFormInsert,
} from "./competition-form.table";

export async function getFormsByCompetitionId(
  competitionId: string
): Promise<CompetitionFormSelect[]> {
  const res = await apiClient<CompetitionFormSelect[]>(`competitions/${competitionId}/forms`);
  return res.data || [];
}

export async function getFormByCompetitionId(
  competitionId: string
): Promise<CompetitionFormSelect | null> {
  const forms = await getFormsByCompetitionId(competitionId);
  return forms[0] || null;
}

export async function getOrCreateFormByCompetitionId(
  competitionId: string
): Promise<CompetitionFormSelect> {
  const res = await apiClient<CompetitionFormSelect>(`competitions/${competitionId}/form/active-or-create`);
  return res.data!;
}

export async function getCompetitionFormById(id: string): Promise<CompetitionFormSelect | null> {
  const res = await apiClient<CompetitionFormSelect>(`competitions/forms/${id}`);
  return res.data || null;
}

export async function createCompetitionForm(
  data: CompetitionFormInsert
): Promise<CompetitionFormSelect> {
  const res = await apiClient<CompetitionFormSelect>("competitions/forms/save", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data!;
}

export async function updateCompetitionForm(
  id: string,
  data: Partial<CompetitionFormInsert>
): Promise<CompetitionFormSelect | null> {
  const res = await apiClient<CompetitionFormSelect>("competitions/forms/save", {
    method: "POST",
    body: JSON.stringify({ ...data, id }),
  });
  return res.data || null;
}

export async function deleteCompetitionForm(id: string): Promise<boolean> {
  const res = await apiClient(`competitions/forms/${id}`, {
    method: "DELETE",
  });
  return res.success;
}

export async function getAllCompetitionForms(): Promise<any[]> {
  const res = await apiClient<any[]>("competitions/forms/all");
  return res.data || [];
}
