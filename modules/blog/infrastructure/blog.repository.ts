import { db } from "@/db";
import {
  blogsTable,
  BlogInsert,
  BlogSelect,
  commentsTable,
  CommentInsert,
  CommentSelect,
} from "./blog.table";
import { desc, eq } from "drizzle-orm";

export async function getAllBlogs(): Promise<BlogSelect[]> {
  return await db.select().from(blogsTable).orderBy(desc(blogsTable.createdAt));
}

export async function getBlogById(id: string): Promise<BlogSelect | null> {
  const result = await db.select().from(blogsTable).where(eq(blogsTable.id, id));
  return result[0] || null;
}

export async function createBlog(data: BlogInsert): Promise<BlogSelect> {
  const result = await db.insert(blogsTable).values(data).returning();
  return result[0];
}

export async function updateBlog(id: string, data: Partial<BlogInsert>): Promise<BlogSelect | null> {
  const result = await db
    .update(blogsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(blogsTable.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteBlog(id: string): Promise<boolean> {
  const result = await db.delete(blogsTable).where(eq(blogsTable.id, id)).returning();
  return result.length > 0;
}

export async function toggleCommentStatus(id: string, newStatus: boolean): Promise<BlogSelect | null> {
  const result = await db
    .update(blogsTable)
    .set({ commentStatus: newStatus, updatedAt: new Date() })
    .where(eq(blogsTable.id, id))
    .returning();
  return result[0] || null;
}

export async function toggleBlogStatus(id: string, newStatus: "PUBLIC" | "PRIVATE"): Promise<BlogSelect | null> {
  const result = await db
    .update(blogsTable)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(blogsTable.id, id))
    .returning();
  return result[0] || null;
}

// Comment Repository Operations
export async function getCommentsByBlogId(blogId: string): Promise<CommentSelect[]> {
  return await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.blogId, blogId))
    .orderBy(desc(commentsTable.createdAt));
}

export async function createComment(data: CommentInsert): Promise<CommentSelect> {
  const result = await db.insert(commentsTable).values(data).returning();
  return result[0];
}

export async function deleteComment(id: string): Promise<boolean> {
  const result = await db.delete(commentsTable).where(eq(commentsTable.id, id)).returning();
  return result.length > 0;
}

export async function toggleCommentApproval(id: string, isApproved: boolean): Promise<CommentSelect | null> {
  const result = await db
    .update(commentsTable)
    .set({ isApproved, updatedAt: new Date() })
    .where(eq(commentsTable.id, id))
    .returning();
  return result[0] || null;
}
