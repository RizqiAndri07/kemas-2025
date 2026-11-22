import { pgTable, uuid, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const blogsTable = pgTable("blogs", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  tag: varchar("tag", { length: 255 }),
  status: varchar("status", { length: 20 }).default("PUBLIC").notNull(),
  commentStatus: boolean("comment_status").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const commentsTable = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  blogId: uuid("blog_id")
    .notNull()
    .references(() => blogsTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }),
  content: text("content").notNull(),
  isApproved: boolean("is_approved").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Alias fleksibilitas bahasa (comentar / comments)
export const comentarTable = commentsTable;

export const blogsRelations = relations(blogsTable, ({ many }) => ({
  comments: many(commentsTable),
}));

export const commentsRelations = relations(commentsTable, ({ one }) => ({
  blog: one(blogsTable, {
    fields: [commentsTable.blogId],
    references: [blogsTable.id],
  }),
}));

export type BlogSelect = typeof blogsTable.$inferSelect;
export type BlogInsert = typeof blogsTable.$inferInsert;

export type CommentSelect = typeof commentsTable.$inferSelect;
export type CommentInsert = typeof commentsTable.$inferInsert;
