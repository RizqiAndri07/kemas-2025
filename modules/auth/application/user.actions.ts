"use server";

import { revalidatePath } from "next/cache";
import { userFormSchema, UserFormInput } from "../domain/user.schema";
import { UserStatus } from "../domain/user-status.enum";
import * as userRepo from "../infrastructure/user.repository";
import { ActionResult } from "@/modules/shared/domain/common.types";
import { requireSuperadmin } from "./auth.guard";
import { createAdminClient } from "@/lib/supabase/server";

export async function createUserAction(
  payload: UserFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Verifikasi Hak Akses Superadmin
    await requireSuperadmin();

    const validated = userFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi gagal",
      };
    }

    if (!validated.data.password || validated.data.password.length < 8) {
      return {
        success: false,
        error: "Kata sandi awal minimal 8 karakter wajib diisi untuk pengguna baru",
      };
    }

    // 2. Periksa duplikasi username atau email
    const conflict = await userRepo.findConflictingUser(
      validated.data.username,
      validated.data.email
    );
    if (conflict) {
      if (conflict.username.toLowerCase() === validated.data.username.toLowerCase()) {
        return { success: false, error: "Username sudah terdaftar" };
      }
      if (conflict.email.toLowerCase() === validated.data.email.toLowerCase()) {
        return { success: false, error: "Email sudah terdaftar" };
      }
    }

    // 3. Buat akun di Supabase Auth via Admin API
    const adminClient = createAdminClient();
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: validated.data.email,
      password: validated.data.password,
      email_confirm: true,
      user_metadata: {
        username: validated.data.username,
        role: validated.data.role,
      },
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || "Gagal membuat akun autentikasi di Supabase",
      };
    }

    // 4. Simpan ke database PostgreSQL usersTable dengan ID yang sama
    try {
      const newUser = await userRepo.createUser({
        id: authData.user.id,
        username: validated.data.username,
        email: validated.data.email,
        role: validated.data.role,
        status: UserStatus.VERIFIED,
      });

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/users");
      return {
        success: true,
        data: { id: newUser.id },
        message: "Pengguna berhasil ditambahkan dan siap digunakan untuk login!",
      };
    } catch (dbError) {
      // Rollback di Supabase Auth jika penyimpanan ke PostgreSQL gagal
      await adminClient.auth.admin.deleteUser(authData.user.id);
      throw dbError;
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menambahkan pengguna",
    };
  }
}

export async function updateUserAction(
  id: string,
  payload: UserFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Verifikasi Hak Akses Superadmin
    await requireSuperadmin();

    const validated = userFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi gagal",
      };
    }

    // Periksa duplikasi dengan pengguna lain
    const conflict = await userRepo.findConflictingUser(
      validated.data.username,
      validated.data.email,
      id
    );
    if (conflict) {
      if (conflict.username.toLowerCase() === validated.data.username.toLowerCase()) {
        return { success: false, error: "Username sudah digunakan oleh akun lain" };
      }
      if (conflict.email.toLowerCase() === validated.data.email.toLowerCase()) {
        return { success: false, error: "Email sudah digunakan oleh akun lain" };
      }
    }

    const updated = await userRepo.updateUser(id, {
      username: validated.data.username,
      email: validated.data.email,
      role: validated.data.role,
    });

    if (!updated) {
      return { success: false, error: "Pengguna tidak ditemukan" };
    }

    // Sinkronkan ke Supabase Auth jika password atau profil diubah
    try {
      const adminClient = createAdminClient();
      const updateData: {
        email?: string;
        password?: string;
        user_metadata?: { username: string; role: string };
      } = {
        email: validated.data.email,
        user_metadata: {
          username: validated.data.username,
          role: validated.data.role,
        },
      };

      if (validated.data.password && validated.data.password.length >= 8) {
        updateData.password = validated.data.password;
      }

      await adminClient.auth.admin.updateUserById(id, updateData);
    } catch (syncError) {
      console.warn("Gagal sinkronisasi data ke Supabase Auth:", syncError);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/users");
    return {
      success: true,
      data: { id: updated.id },
      message: "Data pengguna berhasil diperbarui!",
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui pengguna",
    };
  }
}

export async function deleteUserAction(id: string): Promise<ActionResult<void>> {
  try {
    // 1. Verifikasi Hak Akses Superadmin
    await requireSuperadmin();

    // Hapus dari Supabase Auth
    try {
      const adminClient = createAdminClient();
      await adminClient.auth.admin.deleteUser(id);
    } catch (authError) {
      console.warn("User tidak ditemukan di Supabase Auth atau sudah terhapus:", authError);
    }

    const deleted = await userRepo.deleteUser(id);
    if (!deleted) {
      return {
        success: false,
        error: "Pengguna tidak ditemukan atau gagal dihapus dari database",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/users");
    return {
      success: true,
      data: undefined,
      message: "Pengguna berhasil dihapus!",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus pengguna",
    };
  }
}

export async function toggleUserStatusAction(
  id: string,
  newStatus: "verified" | "unverified"
): Promise<ActionResult<void>> {
  try {
    // 1. Verifikasi Hak Akses Superadmin
    await requireSuperadmin();

    const updated = await userRepo.toggleUserStatus(id, newStatus);
    if (!updated) {
      return {
        success: false,
        error: "Pengguna tidak ditemukan",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/users");
    return {
      success: true,
      data: undefined,
      message: `Status pengguna berhasil diubah ke ${newStatus}!`,
    };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui status pengguna",
    };
  }
}
