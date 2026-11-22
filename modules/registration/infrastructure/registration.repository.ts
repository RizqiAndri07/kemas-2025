import { db } from "@/db";
import {
  registrationsTable,
  RegistrationSelect,
} from "./registration.table";
import { competitionsTable } from "../../competition/infrastructure/competition.table";
import { competitionFormsTable } from "../../competition/infrastructure/competition-form.table";
import { usersTable } from "../../auth/infrastructure/user.table";
import {
  RegistrationFilterParams,
  RegistrationItem,
  RegistrationListResult,
  RegistrationStats,
} from "../domain/registration.interface";
import { RegistrationStatus } from "../domain/registration-status.enum";
import { eq, and, desc, asc, ilike, sql, count } from "drizzle-orm";

export async function getRegistrations(
  params: RegistrationFilterParams = {}
): Promise<RegistrationListResult> {
  const {
    competitionId,
    status,
    search,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const offset = (page - 1) * limit;

  // Build conditions
  const conditions = [];

  if (competitionId && competitionId !== "ALL" && competitionId.trim() !== "") {
    conditions.push(eq(registrationsTable.competitionId, competitionId));
  }

  if (status && status !== "ALL") {
    conditions.push(eq(registrationsTable.status, status as RegistrationStatus));
  }

  if (search && search.trim() !== "") {
    const searchPattern = `%${search.trim()}%`;
    conditions.push(
      sql`(${registrationsTable.registrationNumber} ILIKE ${searchPattern} OR CAST(${registrationsTable.data} AS TEXT) ILIKE ${searchPattern})`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Total count
  const countQuery = await db
    .select({ value: count() })
    .from(registrationsTable)
    .where(whereClause);
  const total = Number(countQuery[0]?.value || 0);

  // Sorting
  const sortColumn =
    sortBy === "registrationNumber"
      ? registrationsTable.registrationNumber
      : sortBy === "status"
      ? registrationsTable.status
      : registrationsTable.createdAt;

  const orderClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  // Data query with joins
  const rows = await db
    .select({
      id: registrationsTable.id,
      competitionId: registrationsTable.competitionId,
      competitionName: competitionsTable.name,
      competitionType: competitionsTable.type,
      formId: registrationsTable.formId,
      formTitle: competitionFormsTable.title,
      registrationNumber: registrationsTable.registrationNumber,
      data: registrationsTable.data,
      files: registrationsTable.files,
      status: registrationsTable.status,
      notes: registrationsTable.notes,
      ipAddress: registrationsTable.ipAddress,
      userAgent: registrationsTable.userAgent,
      verifiedAt: registrationsTable.verifiedAt,
      verifiedBy: registrationsTable.verifiedBy,
      verifiedByUsername: usersTable.username,
      createdAt: registrationsTable.createdAt,
      updatedAt: registrationsTable.updatedAt,
    })
    .from(registrationsTable)
    .innerJoin(
      competitionsTable,
      eq(registrationsTable.competitionId, competitionsTable.id)
    )
    .innerJoin(
      competitionFormsTable,
      eq(registrationsTable.formId, competitionFormsTable.id)
    )
    .leftJoin(usersTable, eq(registrationsTable.verifiedBy, usersTable.id))
    .where(whereClause)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  return {
    data: rows as RegistrationItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getRegistrationById(id: string): Promise<RegistrationItem | null> {
  const rows = await db
    .select({
      id: registrationsTable.id,
      competitionId: registrationsTable.competitionId,
      competitionName: competitionsTable.name,
      competitionType: competitionsTable.type,
      formId: registrationsTable.formId,
      formTitle: competitionFormsTable.title,
      registrationNumber: registrationsTable.registrationNumber,
      data: registrationsTable.data,
      files: registrationsTable.files,
      status: registrationsTable.status,
      notes: registrationsTable.notes,
      ipAddress: registrationsTable.ipAddress,
      userAgent: registrationsTable.userAgent,
      verifiedAt: registrationsTable.verifiedAt,
      verifiedBy: registrationsTable.verifiedBy,
      verifiedByUsername: usersTable.username,
      createdAt: registrationsTable.createdAt,
      updatedAt: registrationsTable.updatedAt,
    })
    .from(registrationsTable)
    .innerJoin(
      competitionsTable,
      eq(registrationsTable.competitionId, competitionsTable.id)
    )
    .innerJoin(
      competitionFormsTable,
      eq(registrationsTable.formId, competitionFormsTable.id)
    )
    .leftJoin(usersTable, eq(registrationsTable.verifiedBy, usersTable.id))
    .where(eq(registrationsTable.id, id))
    .limit(1);

  return (rows[0] as RegistrationItem) || null;
}

export async function updateRegistrationStatus(
  id: string,
  input: {
    status: RegistrationStatus;
    notes?: string | null;
    verifiedBy?: string | null;
  }
): Promise<RegistrationSelect | null> {
  const [updated] = await db
    .update(registrationsTable)
    .set({
      status: input.status,
      notes: input.notes !== undefined ? input.notes : undefined,
      verifiedAt: new Date(),
      verifiedBy: input.verifiedBy || null,
      updatedAt: new Date(),
    })
    .where(eq(registrationsTable.id, id))
    .returning();

  return updated || null;
}

export async function deleteRegistration(id: string): Promise<boolean> {
  const [deleted] = await db
    .delete(registrationsTable)
    .where(eq(registrationsTable.id, id))
    .returning();

  return Boolean(deleted);
}

export async function createRegistration(input: {
  competitionId: string;
  formId: string;
  data: Record<string, any>;
  files?: Array<{
    fieldName: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<RegistrationSelect> {
  const regNumber = `KP25-REG-${Date.now().toString().slice(-6)}-${Math.floor(
    100 + Math.random() * 900
  )}`;

  const [created] = await db
    .insert(registrationsTable)
    .values({
      competitionId: input.competitionId,
      formId: input.formId,
      registrationNumber: regNumber,
      data: input.data,
      files: input.files || [],
      status: "UNVERIFIED",
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent || null,
    })
    .returning();

  return created;
}

export async function getRegistrationStats(): Promise<RegistrationStats> {
  const results = await db
    .select({
      status: registrationsTable.status,
      count: count(),
    })
    .from(registrationsTable)
    .groupBy(registrationsTable.status);

  let unverified = 0;
  let verified = 0;
  let rejected = 0;

  for (const r of results) {
    if (r.status === "UNVERIFIED") unverified = Number(r.count);
    if (r.status === "VERIFIED") verified = Number(r.count);
    if (r.status === "REJECTED") rejected = Number(r.count);
  }

  const total = unverified + verified + rejected;

  return { total, unverified, verified, rejected };
}
