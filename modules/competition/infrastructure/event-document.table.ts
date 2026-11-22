import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { competitionsTable } from "./competition.table";

/**
 * Tabel Event Documents (Dokumen / Berkas Kegiatan & Kompetisi)
 * Relasi 1:N dengan competitions (1 kompetisi dapat memiliki banyak berkas / dokumen)
 */
export const eventDocumentsTable = pgTable("event_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  competitionId: uuid("competition_id")
    .notNull()
    .references(() => competitionsTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  filePath: text("file_path").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Alias fleksibilitas domain (competition_documents = event_documents)
export const competitionDocumentsTable = eventDocumentsTable;

// Relasi Drizzle ORM (1:N)
export const competitionsDocumentsRelations = relations(competitionsTable, ({ many }) => ({
  documents: many(eventDocumentsTable),
}));

export const eventDocumentsRelations = relations(eventDocumentsTable, ({ one }) => ({
  competition: one(competitionsTable, {
    fields: [eventDocumentsTable.competitionId],
    references: [competitionsTable.id],
  }),
}));

export type EventDocumentSelect = typeof eventDocumentsTable.$inferSelect;
export type EventDocumentInsert = typeof eventDocumentsTable.$inferInsert;

export type CompetitionDocumentSelect = EventDocumentSelect;
export type CompetitionDocumentInsert = EventDocumentInsert;
