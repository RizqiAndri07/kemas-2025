import { apiClient } from "@/lib/api-client";
import {
  RegistrationFilterParams,
  RegistrationItem,
  RegistrationListResult,
  RegistrationStats,
} from "../domain/registration.interface";
import { RegistrationStatus } from "../domain/registration-status.enum";
import { RegistrationSelect } from "./registration.table";

export async function getRegistrations(
  params: RegistrationFilterParams = {}
): Promise<RegistrationListResult> {
  const queryParams = new URLSearchParams();
  if (params.competitionId) queryParams.set("competitionId", params.competitionId);
  if (params.status) queryParams.set("status", params.status);
  if (params.search) queryParams.set("search", params.search);
  if (params.page) queryParams.set("page", String(params.page));
  if (params.limit) queryParams.set("limit", String(params.limit));
  if (params.sortBy) queryParams.set("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);

  const res = await apiClient<RegistrationItem[]>(`registrations?${queryParams.toString()}`);
  return {
    data: res.data || [],
    total: res.total || 0,
    page: res.page || 1,
    limit: res.limit || 10,
    totalPages: res.totalPages || 1,
  };
}

export async function getRegistrationById(id: string): Promise<RegistrationItem | null> {
  const res = await apiClient<RegistrationItem>(`registrations/${id}`);
  return res.data || null;
}

export async function updateRegistrationStatus(
  id: string,
  input: {
    status: RegistrationStatus;
    notes?: string | null;
    verifiedBy?: string | null;
  }
): Promise<RegistrationSelect | null> {
  const res = await apiClient<RegistrationSelect>(`registrations/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return res.data || null;
}

export async function deleteRegistration(id: string): Promise<boolean> {
  const res = await apiClient(`registrations/${id}`, {
    method: "DELETE",
  });
  return res.success;
}

export async function createRegistration(input: any): Promise<RegistrationSelect> {
  const res = await apiClient<RegistrationSelect>("registrations", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data!;
}

export async function getRegistrationStats(): Promise<RegistrationStats> {
  const res = await apiClient<RegistrationStats>("registrations/stats");
  return res.data || { total: 0, unverified: 0, verified: 0, rejected: 0 };
}
