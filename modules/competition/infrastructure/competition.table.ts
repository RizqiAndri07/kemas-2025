import { pgTable, uuid, varchar, text, integer, timestamp, pgEnum, jsonb, boolean } from "drizzle-orm/pg-core";

export const competitionTypeEnum = pgEnum("competition_type", [
  "EVENT",
  "TOURNAMENT",
]);

export const competitionStatusEnum = pgEnum("competition_status", [
  "OPEN",
  "CLOSED",
  "UPCOMING",
  "COMPLETED",
]);

export interface PriceListItem {
  id: string;
  name: string;
  price: number;
}

export const competitionsTable = pgTable("competitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  type: competitionTypeEnum("type").default("TOURNAMENT").notNull(),
  registrationStartDate: timestamp("registration_start_date", { withTimezone: true }).notNull(),
  registrationEndDate: timestamp("registration_end_date", { withTimezone: true }).notNull(),
  eventStartDate: timestamp("event_start_date", { withTimezone: true }).notNull(),
  eventEndDate: timestamp("event_end_date", { withTimezone: true }).notNull(),
  fee: integer("fee").default(0).notNull(), // 0 = Free Entry
  priceList: jsonb("price_list")
    .$type<PriceListItem[]>()
    .default([{ id: "default", name: "Normal Price", price: 0 }])
    .notNull(),
  selectedPriceId: varchar("selected_price_id", { length: 50 })
    .default("default")
    .notNull(),
  guidebookUrl: text("guidebook_url"),
  description: text("description"),
  maxQuota: integer("max_quota"),
  status: competitionStatusEnum("status").default("OPEN").notNull(),
  noRegistrationNeeded: boolean("no_registration_needed").default(false).notNull(),
  activeFormId: uuid("active_form_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type CompetitionSelect = typeof competitionsTable.$inferSelect;
export type CompetitionInsert = typeof competitionsTable.$inferInsert;
