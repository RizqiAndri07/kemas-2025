import { createClient } from "@/lib/supabase/server";
import { getUserByEmail, getUserById } from "../infrastructure/user.repository";
import { UserRole } from "../domain/role.enum";
import { UserSelect } from "../infrastructure/user.table";
import { User as AuthUser } from "@supabase/supabase-js";

export interface AuthenticatedUserContext {
  authUser: AuthUser;
  dbUser: UserSelect | null;
}

/**
 * Memverifikasi apakah request berasal dari pengguna yang memiliki sesi aktif.
 * Mengembalikan objek AuthUser Supabase dan entitas UserSelect dari PostgreSQL.
 * Melempar error jika sesi tidak ditemukan atau tidak valid.
 */
export async function requireAuthUser(): Promise<AuthenticatedUserContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Akses ditolak: Anda harus login untuk melakukan tindakan ini.");
  }

  // Cari data profil pengguna di database PostgreSQL
  let dbUser: UserSelect | null = null;
  if (user.id) {
    dbUser = await getUserById(user.id);
  }
  if (!dbUser && user.email) {
    dbUser = await getUserByEmail(user.email);
  }

  return { authUser: user, dbUser };
}

/**
 * Memverifikasi apakah pengguna yang sedang login memiliki peran SUPERADMIN.
 * Melempar error jika pengguna bukan SUPERADMIN.
 */
export async function requireSuperadmin(): Promise<AuthenticatedUserContext> {
  const context = await requireAuthUser();

  if (!context.dbUser || context.dbUser.role !== UserRole.SUPERADMIN) {
    throw new Error("Akses ditolak: Tindakan ini memerlukan hak akses Superadmin.");
  }

  return context;
}
