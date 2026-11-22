import { pgTable, uuid, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { competitionsTable } from "./competition.table";
import { FormSectionConfig } from "../domain/competition-form.interface";

/**
 * Tabel Formulir Pendaftaran Kompetisi (competition_forms)
 * Relasi 1:M dengan competitions (1 kompetisi dapat memiliki banyak varian/riwayat formulir pendaftaran).
 */
export const competitionFormsTable = pgTable("competition_forms", {
  id: uuid("id").defaultRandom().primaryKey(),
  competitionId: uuid("competition_id")
    .notNull()
    .references(() => competitionsTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  sections: jsonb("sections").$type<FormSectionConfig[]>().notNull().default([]),
  
  // Standar audit trail wajib (AGENTS.md Rule 7)
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Relasi Drizzle ORM
export const competitionsFormsRelations = relations(competitionsTable, ({ many, one }) => ({
  forms: many(competitionFormsTable),
  activeForm: one(competitionFormsTable, {
    fields: [competitionsTable.activeFormId],
    references: [competitionFormsTable.id],
  }),
}));

export const competitionFormsRelations = relations(competitionFormsTable, ({ one }) => ({
  competition: one(competitionsTable, {
    fields: [competitionFormsTable.competitionId],
    references: [competitionsTable.id],
  }),
}));

export type CompetitionFormSelect = typeof competitionFormsTable.$inferSelect;
export type CompetitionFormInsert = typeof competitionFormsTable.$inferInsert;
