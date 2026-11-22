import { db } from "@/db";
import {
  eventDocumentsTable,
  EventDocumentSelect,
  EventDocumentInsert,
} from "./event-document.table";
import { eq, asc, inArray } from "drizzle-orm";
import { deleteGuidebookFile } from "./competition-file.helper";

/**
 * Mengambil seluruh dokumen yang berelasi dengan suatu kompetisi
 */
export async function getDocumentsByCompetitionId(
  competitionId: string
): Promise<EventDocumentSelect[]> {
  return await db
    .select()
    .from(eventDocumentsTable)
    .where(eq(eventDocumentsTable.competitionId, competitionId))
    .orderBy(asc(eventDocumentsTable.createdAt));
}

/**
 * Mengambil map seluruh dokumen yang dikelompokkan berdasarkan competitionId
 */
export async function getDocumentsGroupedByCompetition(): Promise<
  Map<string, EventDocumentSelect[]>
> {
  const allDocs = await db
    .select()
    .from(eventDocumentsTable)
    .orderBy(asc(eventDocumentsTable.createdAt));

  const map = new Map<string, EventDocumentSelect[]>();
  for (const doc of allDocs) {
    const list = map.get(doc.competitionId) || [];
    list.push(doc);
    map.set(doc.competitionId, list);
  }
  return map;
}

/**
 * Sinkronisasi dokumen untuk suatu kompetisi (Create, Update, Delete)
 */
export async function setCompetitionDocuments(
  competitionId: string,
  documents: Array<{ id?: string; name: string; filePath: string }>
): Promise<EventDocumentSelect[]> {
  // 1. Ambil dokumen lama
  const existingDocs = await getDocumentsByCompetitionId(competitionId);
  const newFilePaths = new Set(documents.map((d) => d.filePath.trim()));

  // 2. Bersihkan berkas fisik yang tidak lagi digunakan
  for (const oldDoc of existingDocs) {
    if (!newFilePaths.has(oldDoc.filePath.trim())) {
      await deleteGuidebookFile(oldDoc.filePath);
    }
  }

  // 3. Hapus relasi dokumen lama dari database
  await db
    .delete(eventDocumentsTable)
    .where(eq(eventDocumentsTable.competitionId, competitionId));

  // 4. Jika ada dokumen baru, masukkan ke database
  const validDocs = documents.filter(
    (d) => d.name.trim() !== "" && d.filePath.trim() !== ""
  );

  if (validDocs.length === 0) {
    return [];
  }

  const inserted = await db
    .insert(eventDocumentsTable)
    .values(
      validDocs.map((doc) => ({
        competitionId,
        name: doc.name.trim(),
        filePath: doc.filePath.trim(),
      }))
    )
    .returning();

  return inserted;
}

/**
 * Menghapus seluruh dokumen kompetisi beserta pembersihan berkas fisik
 */
export async function deleteDocumentsByCompetitionId(
  competitionId: string
): Promise<void> {
  const existingDocs = await getDocumentsByCompetitionId(competitionId);

  // Bersihkan berkas fisik di disk
  for (const doc of existingDocs) {
    await deleteGuidebookFile(doc.filePath);
  }

  // Hapus baris di tabel database
  await db
    .delete(eventDocumentsTable)
    .where(eq(eventDocumentsTable.competitionId, competitionId));
}
