import { pgTable, uuid, varchar, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { competitionsTable } from "./competition.table";

export const contactPersonsTable = pgTable("contact_persons", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const competitionContactPersonsTable = pgTable(
  "competition_contact_persons",
  {
    competitionId: uuid("competition_id")
      .notNull()
      .references(() => competitionsTable.id, { onDelete: "cascade" }),
    contactPersonId: uuid("contact_person_id")
      .notNull()
      .references(() => contactPersonsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.competitionId, table.contactPersonId] }),
  ]
);

export type ContactPersonSelect = typeof contactPersonsTable.$inferSelect;
export type ContactPersonInsert = typeof contactPersonsTable.$inferInsert;
export type CompetitionContactPersonSelect = typeof competitionContactPersonsTable.$inferSelect;
