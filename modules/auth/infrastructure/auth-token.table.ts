import { pgTable, uuid, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./user.table";

export const authTokenTypeEnum = pgEnum("auth_token_type", [
  "VERIFICATION",
  "PASSWORD_RESET",
]);

export const authTokensTable = pgTable("auth_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  type: authTokenTypeEnum("type").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AuthTokenSelect = typeof authTokensTable.$inferSelect;
export type AuthTokenInsert = typeof authTokensTable.$inferInsert;
