import { getAllUsers } from "@/modules/auth/infrastructure/user.repository";
import { UserTable } from "@/modules/auth/presentation/components/user-table";
import { PageHeader } from "@/components/dashboard/PageHeader";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola akun panitia, hak akses peran (RBAC), dan status verifikasi akun platform Kemas Prasasti 2025."
      />
      <UserTable users={users} />
    </div>
  );
}
