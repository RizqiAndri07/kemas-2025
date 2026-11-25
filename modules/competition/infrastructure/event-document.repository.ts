import { apiClient } from "@/lib/api-client";
import { EventDocumentSelect } from "./event-document.table";

export async function getDocumentsByCompetitionId(
  competitionId: string
): Promise<EventDocumentSelect[]> {
  const res = await apiClient<any>(`competitions/${competitionId}`);
  return res.data?.documents || [];
}

export async function getDocumentsGroupedByCompetition(): Promise<
  Map<string, EventDocumentSelect[]>
> {
  const res = await apiClient<any[]>("competitions");
  const map = new Map<string, EventDocumentSelect[]>();
  if (res.data) {
    for (const comp of res.data) {
      map.set(comp.id, comp.documents || []);
    }
  }
  return map;
}

export async function setCompetitionDocuments(
  competitionId: string,
  documents: Array<{ id?: string; name: string; filePath: string }>
): Promise<EventDocumentSelect[]> {
  return [];
}

export async function deleteDocumentsByCompetitionId(
  competitionId: string
): Promise<void> {}
