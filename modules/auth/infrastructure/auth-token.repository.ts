import { db } from "@/db";
import { authTokensTable, AuthTokenSelect, AuthTokenInsert } from "./auth-token.table";
import { usersTable, UserSelect } from "./user.table";
import { eq, and, gt, isNull } from "drizzle-orm";
import { TokenType } from "../domain/token-type.enum";

export async function createAuthToken(data: {
  userId: string;
  token: string;
  type: TokenType;
  expiresAt: Date;
}): Promise<AuthTokenSelect> {
  const result = await db
    .insert(authTokensTable)
    .values({
      userId: data.userId,
      token: data.token,
      type: data.type,
      expiresAt: data.expiresAt,
    })
    .returning();
  return result[0];
}

export async function findValidAuthToken(
  token: string,
  type: TokenType
): Promise<{ token: AuthTokenSelect; user: UserSelect } | null> {
  const now = new Date();
  const rows = await db
    .select({
      token: authTokensTable,
      user: usersTable,
    })
    .from(authTokensTable)
    .innerJoin(usersTable, eq(authTokensTable.userId, usersTable.id))
    .where(
      and(
        eq(authTokensTable.token, token),
        eq(authTokensTable.type, type),
        isNull(authTokensTable.usedAt),
        gt(authTokensTable.expiresAt, now)
      )
    )
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

/**
 * Mengambil record token bersama user tanpa memfilter status usedAt dan expiresAt,
 * untuk keperluan pengecekan spesifik (apakah token tidak ada, sudah terpakai, atau kedaluwarsa).
 */
export async function getAuthTokenRecord(
  token: string,
  type: TokenType
): Promise<{ token: AuthTokenSelect; user: UserSelect } | null> {
  const rows = await db
    .select({
      token: authTokensTable,
      user: usersTable,
    })
    .from(authTokensTable)
    .innerJoin(usersTable, eq(authTokensTable.userId, usersTable.id))
    .where(
      and(
        eq(authTokensTable.token, token),
        eq(authTokensTable.type, type)
      )
    )
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}


export async function markAuthTokenUsed(id: string): Promise<boolean> {
  const result = await db
    .update(authTokensTable)
    .set({ usedAt: new Date() })
    .where(eq(authTokensTable.id, id))
    .returning();
  return result.length > 0;
}

export async function invalidateUserTokens(
  userId: string,
  type: TokenType
): Promise<void> {
  await db
    .update(authTokensTable)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(authTokensTable.userId, userId),
        eq(authTokensTable.type, type),
        isNull(authTokensTable.usedAt)
      )
    );
}
