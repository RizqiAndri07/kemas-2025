import { apiClient } from "@/lib/api-client";
import { UserRole } from "../domain/role.enum";
import { UserSelect } from "../infrastructure/user.table";

export interface AuthenticatedUserContext {
  authUser: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  dbUser: UserSelect | null;
}

export async function requireAuthUser(): Promise<AuthenticatedUserContext> {
  const res = await apiClient<{
    id: string;
    email: string;
    username: string;
    role: string;
    status: string;
  }>("auth/me");

  if (!res.success || !res.data) {
    throw new Error("Akses ditolak: Anda harus login untuk melakukan tindakan ini.");
  }

  const user = res.data;
  const dbUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role as any,
    status: user.status as any,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as UserSelect;

  return { authUser: user, dbUser };
}

export async function requireSuperadmin(): Promise<AuthenticatedUserContext> {
  const context = await requireAuthUser();

  if (!context.dbUser || context.dbUser.role !== UserRole.SUPERADMIN) {
    throw new Error("Akses ditolak: Tindakan ini memerlukan hak akses Superadmin.");
  }

  return context;
}
