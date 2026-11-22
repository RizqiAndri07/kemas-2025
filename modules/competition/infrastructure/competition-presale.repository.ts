import { db } from "@/db";
import {
  competitionPresalesTable,
  CompetitionPresaleSelect,
  CompetitionPresaleInsert,
} from "./competition-presale.table";
import { competitionsTable, CompetitionSelect } from "./competition.table";
import { desc, eq, and, ne } from "drizzle-orm";

export interface PresaleWithCompetition extends CompetitionPresaleSelect {
  competitionName: string;
}

export async function getAllPresales(competitionId?: string): Promise<CompetitionPresaleSelect[]> {
  if (competitionId) {
    return await db
      .select()
      .from(competitionPresalesTable)
      .where(eq(competitionPresalesTable.competitionId, competitionId))
      .orderBy(competitionPresalesTable.startDate);
  }

  return await db
    .select()
    .from(competitionPresalesTable)
    .orderBy(desc(competitionPresalesTable.createdAt));
}

export async function getPresalesWithCompetition(competitionId?: string): Promise<PresaleWithCompetition[]> {
  const query = db
    .select({
      id: competitionPresalesTable.id,
      competitionId: competitionPresalesTable.competitionId,
      name: competitionPresalesTable.name,
      price: competitionPresalesTable.price,
      startDate: competitionPresalesTable.startDate,
      endDate: competitionPresalesTable.endDate,
      quota: competitionPresalesTable.quota,
      isActive: competitionPresalesTable.isActive,
      createdAt: competitionPresalesTable.createdAt,
      updatedAt: competitionPresalesTable.updatedAt,
      competitionName: competitionsTable.name,
    })
    .from(competitionPresalesTable)
    .innerJoin(competitionsTable, eq(competitionPresalesTable.competitionId, competitionsTable.id))
    .orderBy(competitionPresalesTable.startDate);

  if (competitionId) {
    return await query.where(eq(competitionPresalesTable.competitionId, competitionId));
  }

  return await query;
}

export async function getPresaleById(id: string): Promise<CompetitionPresaleSelect | null> {
  const result = await db
    .select()
    .from(competitionPresalesTable)
    .where(eq(competitionPresalesTable.id, id));
  return result[0] || null;
}

export async function getActivePresaleForCompetition(competitionId: string): Promise<CompetitionPresaleSelect | null> {
  const result = await db
    .select()
    .from(competitionPresalesTable)
    .where(and(eq(competitionPresalesTable.competitionId, competitionId), eq(competitionPresalesTable.isActive, true)));
  return result[0] || null;
}

export async function createPresale(data: CompetitionPresaleInsert): Promise<CompetitionPresaleSelect> {
  // Aturan: 1 event hanya boleh memiliki maksimal 1 presale aktif
  if (data.isActive) {
    await db
      .update(competitionPresalesTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(competitionPresalesTable.competitionId, data.competitionId));
  }

  const result = await db.insert(competitionPresalesTable).values(data).returning();
  
  // Update flag hasPresale = true pada kompetisi terkait
  await db
    .update(competitionsTable)
    .set({ hasPresale: true, updatedAt: new Date() })
    .where(eq(competitionsTable.id, data.competitionId));

  return result[0];
}

export async function updatePresale(
  id: string,
  data: Partial<CompetitionPresaleInsert>
): Promise<CompetitionPresaleSelect | null> {
  const target = await getPresaleById(id);
  if (!target) return null;

  const compId = data.competitionId || target.competitionId;

  // Aturan: 1 event hanya boleh memiliki maksimal 1 presale aktif
  if (data.isActive === true) {
    await db
      .update(competitionPresalesTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(competitionPresalesTable.competitionId, compId), ne(competitionPresalesTable.id, id)));
  }

  const result = await db
    .update(competitionPresalesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(competitionPresalesTable.id, id))
    .returning();
  return result[0] || null;
}

export async function deletePresale(id: string): Promise<boolean> {
  const target = await getPresaleById(id);
  const result = await db
    .delete(competitionPresalesTable)
    .where(eq(competitionPresalesTable.id, id))
    .returning();

  if (target) {
    const remaining = await getAllPresales(target.competitionId);
    if (remaining.length === 0) {
      await db
        .update(competitionsTable)
        .set({ hasPresale: false, updatedAt: new Date() })
        .where(eq(competitionsTable.id, target.competitionId));
    }
  }

  return result.length > 0;
}

export async function togglePresaleStatus(
  id: string,
  isActive: boolean
): Promise<CompetitionPresaleSelect | null> {
  const target = await getPresaleById(id);
  if (!target) return null;

  // Aturan: 1 event hanya boleh memiliki maksimal 1 presale aktif
  if (isActive) {
    await db
      .update(competitionPresalesTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(competitionPresalesTable.competitionId, target.competitionId), ne(competitionPresalesTable.id, id)));
  }

  const result = await db
    .update(competitionPresalesTable)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(competitionPresalesTable.id, id))
    .returning();
  return result[0] || null;
}
