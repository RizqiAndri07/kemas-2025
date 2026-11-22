import { db } from "@/db";
import { usersTable, UserInsert, UserSelect } from "./user.table";
import { desc, eq, or, and, ne } from "drizzle-orm";

export async function getAllUsers(): Promise<UserSelect[]> {
  return await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
}

export async function getUserById(id: string): Promise<UserSelect | null> {
  const result = await db.select().from(usersTable).where(eq(usersTable.id, id));
  return result[0] || null;
}

export async function getUserByEmail(email: string): Promise<UserSelect | null> {
  const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
  return result[0] || null;
}

export async function getUserByUsername(username: string): Promise<UserSelect | null> {
  const result = await db.select().from(usersTable).where(eq(usersTable.username, username));
  return result[0] || null;
}

export async function findConflictingUser(
  username: string,
  email: string,
  excludeId?: string
): Promise<UserSelect | null> {
  const query = db
    .select()
    .from(usersTable)
    .where(
      excludeId
        ? and(ne(usersTable.id, excludeId), or(eq(usersTable.username, username), eq(usersTable.email, email)))
        : or(eq(usersTable.username, username), eq(usersTable.email, email))
    );
  const result = await query;
  return result[0] || null;
}

export async function createUser(data: UserInsert): Promise<UserSelect> {
  const result = await db.insert(usersTable).values(data).returning();
  return result[0];
}

export async function updateUser(
  id: string,
  data: Partial<UserInsert>
): Promise<UserSelect | null> {
  const result = await db
    .update(usersTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(usersTable.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
  return result.length > 0;
}

export async function toggleUserStatus(
  id: string,
  newStatus: "verified" | "unverified"
): Promise<UserSelect | null> {
  const result = await db
    .update(usersTable)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(usersTable.id, id))
    .returning();
  return result[0] || null;
}

export async function recordLastLogin(id: string): Promise<UserSelect | null> {
  const result = await db
    .update(usersTable)
    .set({ lastLogin: new Date(), updatedAt: new Date() })
    .where(eq(usersTable.id, id))
    .returning();
  return result[0] || null;
}
