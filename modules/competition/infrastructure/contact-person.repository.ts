import { apiClient } from "@/lib/api-client";
import { ContactPersonSelect, ContactPersonInsert } from "./contact-person.table";

export interface ContactPersonWithCompetitions extends ContactPersonSelect {
  competitions: {
    id: string;
    name: string;
  }[];
}

export async function getAllContactPersons(): Promise<ContactPersonWithCompetitions[]> {
  const res = await apiClient<ContactPersonWithCompetitions[]>("competitions/contact-persons");
  return res.data || [];
}

export async function getContactPersonById(id: string): Promise<ContactPersonSelect | null> {
  const list = await getAllContactPersons();
  return list.find((cp) => cp.id === id) || null;
}

export async function createContactPerson(data: ContactPersonInsert): Promise<ContactPersonSelect> {
  const res = await apiClient<ContactPersonSelect>("competitions/contact-persons", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data!;
}

export async function updateContactPerson(
  id: string,
  data: Partial<ContactPersonInsert>
): Promise<ContactPersonSelect | null> {
  const res = await apiClient<ContactPersonSelect>(`competitions/contact-persons/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data || null;
}

export async function deleteContactPerson(id: string): Promise<boolean> {
  const res = await apiClient(`competitions/contact-persons/${id}`, {
    method: "DELETE",
  });
  return res.success;
}

export async function getContactPersonsByCompetitionId(competitionId: string): Promise<ContactPersonSelect[]> {
  const res = await apiClient<any>(`competitions/${competitionId}`);
  return res.data?.contactPersons || [];
}

export async function setCompetitionContactPersons(
  competitionId: string,
  contactPersonIds: string[]
): Promise<void> {
  // Ditangani secara otomatis saat POST/PUT ke /competitions
}
