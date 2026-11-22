import { db } from "@/db";
import { competitionsTable, CompetitionSelect, CompetitionInsert } from "./competition.table";
import { desc, eq } from "drizzle-orm";
import { CompetitionStatus } from "../domain/competition-status.enum";

export async function getAllCompetitions(): Promise<CompetitionSelect[]> {
  return await db
    .select()
    .from(competitionsTable)
    .orderBy(desc(competitionsTable.createdAt));
}

export async function getCompetitionById(id: string): Promise<CompetitionSelect | null> {
  const result = await db
    .select()
    .from(competitionsTable)
    .where(eq(competitionsTable.id, id));
  return result[0] || null;
}

export async function createCompetition(data: CompetitionInsert): Promise<CompetitionSelect> {
  const result = await db.insert(competitionsTable).values(data).returning();
  return result[0];
}

export async function updateCompetition(
  id: string,
  data: Partial<CompetitionInsert>
): Promise<CompetitionSelect | null> {
  const result = await db
    .update(competitionsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(competitionsTable.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteCompetition(id: string): Promise<boolean> {
  const result = await db
    .delete(competitionsTable)
    .where(eq(competitionsTable.id, id))
    .returning();
  return result.length > 0;
}

export async function toggleCompetitionStatus(
  id: string,
  newStatus: CompetitionStatus
): Promise<CompetitionSelect | null> {
  const result = await db
    .update(competitionsTable)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(competitionsTable.id, id))
    .returning();
  return result[0] || null;
}

export async function setActiveForm(
  competitionId: string,
  formId: string | null
): Promise<CompetitionSelect | null> {
  const result = await db
    .update(competitionsTable)
    .set({ activeFormId: formId, updatedAt: new Date() })
    .where(eq(competitionsTable.id, competitionId))
    .returning();
  return result[0] || null;
}
