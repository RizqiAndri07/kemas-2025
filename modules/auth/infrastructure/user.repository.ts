import { apiClient } from "@/lib/api-client";
import { UserSelect, UserInsert } from "./user.table";

export async function getAllUsers(): Promise<UserSelect[]> {
  const res = await apiClient<UserSelect[]>("auth/users");
  return res.data || [];
}

export async function getUserById(id: string): Promise<UserSelect | null> {
  const users = await getAllUsers();
  return users.find((u) => u.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<UserSelect | null> {
  const users = await getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getUserByUsername(username: string): Promise<UserSelect | null> {
  const users = await getAllUsers();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export async function findConflictingUser(
  username: string,
  email: string,
  excludeId?: string
): Promise<UserSelect | null> {
  const users = await getAllUsers();
  return (
    users.find(
      (u) =>
        (!excludeId || u.id !== excludeId) &&
        (u.username.toLowerCase() === username.toLowerCase() ||
          u.email.toLowerCase() === email.toLowerCase())
    ) || null
  );
}

export async function createUser(data: UserInsert): Promise<UserSelect> {
  const res = await apiClient<UserSelect>("auth/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data!;
}

export async function updateUser(
  id: string,
  data: Partial<UserInsert>
): Promise<UserSelect | null> {
  const res = await apiClient<UserSelect>(`auth/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data || null;
}

export async function deleteUser(id: string): Promise<boolean> {
  const res = await apiClient(`auth/users/${id}`, {
    method: "DELETE",
  });
  return res.success;
}

export async function toggleUserStatus(
  id: string,
  newStatus: "verified" | "unverified"
): Promise<UserSelect | null> {
  const res = await apiClient<UserSelect>(`auth/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: newStatus }),
  });
  return res.data || null;
}

export async function recordLastLogin(id: string): Promise<UserSelect | null> {
  return null;
}
