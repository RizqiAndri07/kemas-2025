import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { competitionsTable } from "../../competition/infrastructure/competition.table";
import { competitionFormsTable } from "../../competition/infrastructure/competition-form.table";
import { usersTable } from "../../auth/infrastructure/user.table";
import { registrationStatusEnum } from "../domain/registration-status.enum";

export interface RegistrationUploadedFile {
  fieldName: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export const registrationsTable = pgTable("registrations", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Relasi ke Kompetisi & Formulir
  competitionId: uuid("competition_id")
    .notNull()
    .references(() => competitionsTable.id, { onDelete: "cascade" }),
  formId: uuid("form_id")
    .notNull()
    .references(() => competitionFormsTable.id, { onDelete: "restrict" }),

  // Nomor Registrasi Unik (e.g. KP25-REG-1700000000000-001)
  registrationNumber: varchar("registration_number", { length: 60 })
    .notNull()
    .unique(),

  // Data Isian Dinamis Formulir (Key: fieldId / name, Value: string | string[] | number | boolean)
  data: jsonb("data").$type<Record<string, any>>().notNull(),

  // Berkas yang Diunggah
  files: jsonb("files")
    .$type<RegistrationUploadedFile[]>()
    .default([])
    .notNull(),

  // Status Verifikasi (UNVERIFIED, VERIFIED, REJECTED)
  status: registrationStatusEnum("status").default("UNVERIFIED").notNull(),

  // Catatan Verifikasi atau Alasan Penolakan dari Admin
  notes: text("notes"),

  // Audit Pelacakan Klien & Anti-Spam
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),

  // Audit Verifikasi Admin
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  verifiedBy: uuid("verified_by").references(() => usersTable.id, {
    onDelete: "set null",
  }),

  // Standar Audit Trail (AGENTS.md Rule 7)
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type RegistrationSelect = typeof registrationsTable.$inferSelect;
export type RegistrationInsert = typeof registrationsTable.$inferInsert;
