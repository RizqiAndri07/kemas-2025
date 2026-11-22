import { db } from "@/db";
import {
  contactPersonsTable,
  competitionContactPersonsTable,
  ContactPersonSelect,
  ContactPersonInsert,
} from "./contact-person.table";
import { competitionsTable } from "./competition.table";
import { desc, eq, inArray } from "drizzle-orm";

export interface ContactPersonWithCompetitions extends ContactPersonSelect {
  competitions: {
    id: string;
    name: string;
  }[];
}

export async function getAllContactPersons(): Promise<ContactPersonWithCompetitions[]> {
  const contactPersons = await db
    .select()
    .from(contactPersonsTable)
    .orderBy(desc(contactPersonsTable.createdAt));

  if (contactPersons.length === 0) return [];

  // Ambil data relasi kompetisi untuk setiap contact person
  const relations = await db
    .select({
      contactPersonId: competitionContactPersonsTable.contactPersonId,
      competitionId: competitionsTable.id,
      competitionName: competitionsTable.name,
    })
    .from(competitionContactPersonsTable)
    .innerJoin(
      competitionsTable,
      eq(competitionContactPersonsTable.competitionId, competitionsTable.id)
    );

  const competitionMap = new Map<string, { id: string; name: string }[]>();
  for (const rel of relations) {
    const list = competitionMap.get(rel.contactPersonId) || [];
    list.push({ id: rel.competitionId, name: rel.competitionName });
    competitionMap.set(rel.contactPersonId, list);
  }

  return contactPersons.map((cp) => ({
    ...cp,
    competitions: competitionMap.get(cp.id) || [],
  }));
}

export async function getContactPersonById(id: string): Promise<ContactPersonSelect | null> {
  const result = await db
    .select()
    .from(contactPersonsTable)
    .where(eq(contactPersonsTable.id, id));
  return result[0] || null;
}

export async function createContactPerson(
  data: ContactPersonInsert
): Promise<ContactPersonSelect> {
  const result = await db.insert(contactPersonsTable).values(data).returning();
  return result[0];
}

export async function updateContactPerson(
  id: string,
  data: Partial<ContactPersonInsert>
): Promise<ContactPersonSelect | null> {
  const result = await db
    .update(contactPersonsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(contactPersonsTable.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteContactPerson(id: string): Promise<boolean> {
  const result = await db
    .delete(contactPersonsTable)
    .where(eq(contactPersonsTable.id, id))
    .returning();
  return result.length > 0;
}

export async function getContactPersonsByCompetitionId(
  competitionId: string
): Promise<ContactPersonSelect[]> {
  const result = await db
    .select({
      id: contactPersonsTable.id,
      name: contactPersonsTable.name,
      phone: contactPersonsTable.phone,
      createdAt: contactPersonsTable.createdAt,
      updatedAt: contactPersonsTable.updatedAt,
    })
    .from(competitionContactPersonsTable)
    .innerJoin(
      contactPersonsTable,
      eq(competitionContactPersonsTable.contactPersonId, contactPersonsTable.id)
    )
    .where(eq(competitionContactPersonsTable.competitionId, competitionId));

  return result;
}

export async function setCompetitionContactPersons(
  competitionId: string,
  contactPersonIds: string[]
): Promise<void> {
  // Hapus relasi lama
  await db
    .delete(competitionContactPersonsTable)
    .where(eq(competitionContactPersonsTable.competitionId, competitionId));

  // Masukkan relasi baru jika ada
  if (contactPersonIds && contactPersonIds.length > 0) {
    const values = contactPersonIds.map((cpId) => ({
      competitionId,
      contactPersonId: cpId,
    }));
    await db.insert(competitionContactPersonsTable).values(values);
  }
}
