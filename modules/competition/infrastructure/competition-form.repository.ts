import { db } from "@/db";
import {
  competitionFormsTable,
  CompetitionFormSelect,
  CompetitionFormInsert,
} from "./competition-form.table";
import { competitionsTable } from "./competition.table";
import { desc, eq } from "drizzle-orm";

export async function getFormsByCompetitionId(
  competitionId: string
): Promise<CompetitionFormSelect[]> {
  return await db
    .select()
    .from(competitionFormsTable)
    .where(eq(competitionFormsTable.competitionId, competitionId))
    .orderBy(desc(competitionFormsTable.createdAt));
}

export async function getFormByCompetitionId(
  competitionId: string
): Promise<CompetitionFormSelect | null> {
  const result = await db
    .select()
    .from(competitionFormsTable)
    .where(eq(competitionFormsTable.competitionId, competitionId))
    .limit(1);
  return result[0] || null;
}

export async function getOrCreateFormByCompetitionId(
  competitionId: string
): Promise<CompetitionFormSelect> {
  const existing = await getFormByCompetitionId(competitionId);
  if (existing) {
    return existing;
  }

  // Cari nama kompetisi untuk judul default form
  const compResult = await db
    .select({ name: competitionsTable.name })
    .from(competitionsTable)
    .where(eq(competitionsTable.id, competitionId))
    .limit(1);

  const compName = compResult[0]?.name || "Kompetisi";

  const defaultForm: CompetitionFormInsert = {
    competitionId,
    title: `Formulir Pendaftaran ${compName}`,
    description: `Formulir pendaftaran resmi untuk ${compName}.`,
    sections: [
      {
        id: "section_identitas",
        title: "Identitas Pendaftar",
        description: "Lengkapi data identitas calon peserta lomba.",
        order: 1,
        fields: [],
      },
    ],
  };

  const created = await createCompetitionForm(defaultForm);

  // Set activeFormId di kompetisi agar sinkron
  await db
    .update(competitionsTable)
    .set({ activeFormId: created.id, updatedAt: new Date() })
    .where(eq(competitionsTable.id, competitionId));

  return created;
}

export async function getAllCompetitionForms() {
  return await db
    .select({
      id: competitionFormsTable.id,
      competitionId: competitionFormsTable.competitionId,
      title: competitionFormsTable.title,
      description: competitionFormsTable.description,
      sections: competitionFormsTable.sections,
      createdAt: competitionFormsTable.createdAt,
      updatedAt: competitionFormsTable.updatedAt,
      competitionName: competitionsTable.name,
      competitionActiveFormId: competitionsTable.activeFormId,
      competitionType: competitionsTable.type,
      competitionStatus: competitionsTable.status,
    })
    .from(competitionFormsTable)
    .innerJoin(competitionsTable, eq(competitionFormsTable.competitionId, competitionsTable.id))
    .orderBy(desc(competitionFormsTable.createdAt));
}

export async function getFormById(id: string): Promise<CompetitionFormSelect | null> {
  const result = await db
    .select()
    .from(competitionFormsTable)
    .where(eq(competitionFormsTable.id, id));
  return result[0] || null;
}

export async function createCompetitionForm(
  data: CompetitionFormInsert
): Promise<CompetitionFormSelect> {
  const result = await db.insert(competitionFormsTable).values(data).returning();
  return result[0];
}

export async function updateCompetitionForm(
  id: string,
  data: Partial<CompetitionFormInsert>
): Promise<CompetitionFormSelect | null> {
  const result = await db
    .update(competitionFormsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(competitionFormsTable.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteCompetitionForm(id: string): Promise<boolean> {
  // Jika form yang dihapus adalah activeFormId pada kompetisinya, reset activeFormId ke null
  const form = await getFormById(id);
  if (form) {
    await db
      .update(competitionsTable)
      .set({ activeFormId: null, updatedAt: new Date() })
      .where(eq(competitionsTable.activeFormId, id));
  }

  const result = await db
    .delete(competitionFormsTable)
    .where(eq(competitionFormsTable.id, id))
    .returning();
  return result.length > 0;
}

export async function duplicateCompetitionForm(
  id: string
): Promise<CompetitionFormSelect | null> {
  const existing = await getFormById(id);
  if (!existing) return null;

  const duplicatedData: CompetitionFormInsert = {
    competitionId: existing.competitionId,
    title: `${existing.title} (Salinan)`,
    description: existing.description,
    sections: existing.sections,
  };

  const result = await db
    .insert(competitionFormsTable)
    .values(duplicatedData)
    .returning();
  return result[0] || null;
}
