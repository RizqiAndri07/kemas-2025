"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import {
  createUserSchema,
  CreateUserInput,
  updateUserSchema,
  UpdateUserInput,
} from "../domain/user.schema";
import { UserStatus } from "../domain/user-status.enum";
import { TokenType } from "../domain/token-type.enum";
import * as userRepo from "../infrastructure/user.repository";
import * as tokenRepo from "../infrastructure/auth-token.repository";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from "../infrastructure/email.service";
import { ActionResult } from "@/modules/shared/domain/common.types";
import { requireSuperadmin } from "./auth.guard";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Tambah Pengguna Baru oleh Superadmin
 * Alur:
 * 1. Superadmin hanya mengisi username, email, dan role (tanpa password manual).
 * 2. Akun dibuat di Supabase Auth & PostgreSQL usersTable dengan status unverified.
 * 3. Token verifikasi aman dibuat dengan masa berlaku 12 jam.
 * 4. Email verifikasi dikirim ke email pengguna via SMTP / Mailpit.
 */
export async function createUserAction(
  payload: CreateUserInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Verifikasi Hak Akses Superadmin
    await requireSuperadmin();

    const validated = createUserSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi gagal",
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

    // 3. Buat akun di Supabase Auth via Admin API (dengan random unguessable password awal & unconfirmed)
    const initialTempPassword = `${crypto.randomBytes(16).toString("hex")}!A1`;
    const adminClient = createAdminClient();
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: validated.data.email,
      password: initialTempPassword,
      email_confirm: false,
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

    // 4. Simpan ke database PostgreSQL usersTable dengan ID yang sama & status unverified
    let newUserId = authData.user.id;
    try {
      const newUser = await userRepo.createUser({
        id: authData.user.id,
        username: validated.data.username,
        email: validated.data.email,
        role: validated.data.role,
        status: UserStatus.UNVERIFIED,
      });
      newUserId = newUser.id;
    } catch (dbError) {
      // Rollback di Supabase Auth jika penyimpanan ke PostgreSQL gagal
      await adminClient.auth.admin.deleteUser(authData.user.id);
      throw dbError;
    }

    // 5. Generate token verifikasi aman dengan kedaluwarsa 12 jam
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 jam

    await tokenRepo.createAuthToken({
      userId: newUserId,
      token: verificationToken,
      type: TokenType.VERIFICATION,
      expiresAt,
    });

    // 6. Kirim email verifikasi via SMTP / Mailpit
    try {
      await sendVerificationEmail({
        to: validated.data.email,
        username: validated.data.username,
        token: verificationToken,
      });
    } catch (emailError) {
      console.error("Gagal mengirim email verifikasi:", emailError);
      // Pengguna tetap dibuat, Superadmin dapat menggunakan tombol Kirim Ulang Email
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/users");
    return {
      success: true,
      data: { id: newUserId },
      message: `Pengguna @${validated.data.username} berhasil dibuat. Email verifikasi (berlaku 12 jam) telah dikirim ke ${validated.data.email}!`,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menambahkan pengguna",
    };
  }
}

/**
 * Edit Pengguna oleh Superadmin
 */
export async function updateUserAction(
  id: string,
  payload: UpdateUserInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Verifikasi Hak Akses Superadmin
    await requireSuperadmin();

    const validated = updateUserSchema.safeParse(payload);
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

/**
 * Hapus Pengguna oleh Superadmin
 */
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

/**
 * Toggle Status Pengguna (Verified <-> Unverified)
 */
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

    // Sinkronkan status konfirmasi email ke Supabase Auth
    try {
      const adminClient = createAdminClient();
      await adminClient.auth.admin.updateUserById(id, {
        email_confirm: newStatus === "verified",
      });
    } catch (syncError) {
      console.warn("Gagal sinkronisasi email_confirm ke Supabase:", syncError);
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

/**
 * Kirim Ulang Email Verifikasi oleh Superadmin
 * Berlaku 12 Jam
 */
export async function resendVerificationEmailAction(
  userId: string
): Promise<ActionResult<void>> {
  try {
    await requireSuperadmin();

    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan" };
    }

    // Invalidate token verifikasi lama yang belum terpakai
    await tokenRepo.invalidateUserTokens(userId, TokenType.VERIFICATION);

    // Buat token baru berlaku 12 jam
    const newToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);

    await tokenRepo.createAuthToken({
      userId,
      token: newToken,
      type: TokenType.VERIFICATION,
      expiresAt,
    });

    // Kirim email verifikasi
    await sendVerificationEmail({
      to: user.email,
      username: user.username,
      token: newToken,
    });

    return {
      success: true,
      data: undefined,
      message: `Email verifikasi berhasil dikirim ulang ke ${user.email} (berlaku 12 jam).`,
    };
  } catch (error) {
    console.error("Error resending verification email:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengirim ulang email verifikasi",
    };
  }
}

/**
 * Reset Kata Sandi Pengguna oleh Superadmin
 * Men-generate token reset password berlaku 12 jam dan mengirim email reset ke pengguna.
 */
export async function triggerResetPasswordAction(
  userId: string
): Promise<ActionResult<void>> {
  try {
    await requireSuperadmin();

    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan" };
    }

    // Invalidate token reset password lama
    await tokenRepo.invalidateUserTokens(userId, TokenType.PASSWORD_RESET);

    // Buat token reset baru berlaku 12 jam
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);

    await tokenRepo.createAuthToken({
      userId,
      token: resetToken,
      type: TokenType.PASSWORD_RESET,
      expiresAt,
    });

    // Kirim email reset password
    await sendResetPasswordEmail({
      to: user.email,
      username: user.username,
      token: resetToken,
    });

    return {
      success: true,
      data: undefined,
      message: `Email reset kata sandi berhasil dikirim ke ${user.email} (berlaku 12 jam).`,
    };
  } catch (error) {
    console.error("Error triggering reset password:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal memproses reset kata sandi",
    };
  }
}
