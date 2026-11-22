"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, LoginInput } from "../domain/auth.schema";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetLoginAttempts,
} from "../infrastructure/login-attempt.repository";
import * as userRepo from "../infrastructure/user.repository";
import { ActionResult } from "@/modules/shared/domain/common.types";
import { UserSelect } from "../infrastructure/user.table";
import { TokenType } from "../domain/token-type.enum";
import { UserStatus } from "../domain/user-status.enum";
import * as tokenRepo from "../infrastructure/auth-token.repository";
import {
  sendWelcomeWithRandomPasswordEmail,
} from "../infrastructure/email.service";
import { createAdminClient } from "@/lib/supabase/server";
import {
  setupPasswordSchema,
  SetupPasswordInput,
} from "../domain/auth.schema";
import crypto from "crypto";

export interface SessionUserInfo {
  id: string;
  email: string;
  username: string;
  role: string;
}

export async function loginAction(
  payload: LoginInput
): Promise<ActionResult<{ user: SessionUserInfo }>> {
  try {
    const validated = loginSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi input login gagal",
      };
    }

    const { email, password } = validated.data;
    const cleanEmail = email.trim().toLowerCase();

    // 1. Cek Rate Limiting (Maks 3x dalam 1 menit, lockout 10 menit)
    const rateStatus = await checkRateLimit(cleanEmail);
    if (rateStatus.isLocked) {
      const minutes = rateStatus.remainingMinutes || 10;
      return {
        success: false,
        error: `Terlalu banyak percobaan gagal. Akses dikunci sementara demi keamanan. Silakan coba lagi dalam ${minutes} menit.`,
      };
    }

    // 2. Eksekusi Supabase Auth signInWithPassword
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error || !data.user) {
      // Catat kegagalan login untuk rate limiting
      const failedResult = await recordFailedAttempt(cleanEmail);
      if (failedResult.isLocked) {
        return {
          success: false,
          error:
            "Terlalu banyak percobaan gagal (3 kali dalam 1 menit). Akun dikunci selama 10 menit demi keamanan sistem.",
        };
      }

      return {
        success: false,
        error: `Email atau kata sandi tidak valid. Sisa percobaan: ${failedResult.remainingAttempts} kali sebelum akun dikunci 10 menit.`,
      };
    }

    // 3. Login Berhasil: Reset counter percobaan rate limit
    await resetLoginAttempts(cleanEmail);

    // 4. Update last_login di PostgreSQL usersTable
    let dbUser: UserSelect | null = null;
    if (data.user.id) {
      dbUser = await userRepo.getUserById(data.user.id);
      if (dbUser) {
        await userRepo.recordLastLogin(dbUser.id);
      }
    }
    if (!dbUser && data.user.email) {
      dbUser = await userRepo.getUserByEmail(data.user.email);
      if (dbUser) {
        await userRepo.recordLastLogin(dbUser.id);
      }
    }

    try {
      revalidatePath("/", "layout");
      revalidatePath("/dashboard");
    } catch {
      // Abaikan jika dipanggil di luar HTTP request store Next.js
    }

    return {
      success: true,
      message: "Login berhasil!",
      data: {
        user: {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          username: dbUser?.username || data.user.user_metadata?.username || cleanEmail.split("@")[0],
          role: dbUser?.role || data.user.user_metadata?.role || "ADMIN",
        },
      },
    };
  } catch (error) {
    console.error("Error during login action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan pada sistem autentikasi",
    };
  }
}

export async function logoutAction(): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    try {
      revalidatePath("/", "layout");
      revalidatePath("/dashboard");
    } catch {
      // Abaikan jika dipanggil di luar HTTP request store Next.js
    }

    return {
      success: true,
      message: "Berhasil keluar (logout)",
    };
  } catch (error) {
    console.error("Error during logout action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal melakukan logout",
    };
  }
}

export async function getCurrentSessionUser(): Promise<SessionUserInfo | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    let dbUser: UserSelect | null = null;
    if (user.id) {
      dbUser = await userRepo.getUserById(user.id);
    }
    if (!dbUser && user.email) {
      dbUser = await userRepo.getUserByEmail(user.email);
    }

    return {
      id: user.id,
      email: user.email || "",
      username: dbUser?.username || user.user_metadata?.username || (user.email ? user.email.split("@")[0] : "Admin"),
      role: dbUser?.role || user.user_metadata?.role || "ADMIN",
    };
  } catch {
    return null;
  }
}

function generateRandomPassword(length = 10): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let result = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

/**
 * Verifikasi Token Email Pengguna
 * Alur:
 * 1. Pengecekan status token:
 *    - Token tidak ditemukan -> return code: "INVALID" ("Tautan tidak valid")
 *    - Token usedAt != null -> return code: "ALREADY_USED" ("Tautan tidak valid karena sudah pernah diverifikasi")
 *    - Token expiresAt < now -> return code: "EXPIRED" ("Email expired / lebih dari 12 jam")
 * 2. Jika valid (pertama kali dibuka):
 *    - Token ditandai terpakai (usedAt = now).
 *    - Status user diubah menjadi verified di DB & Supabase Auth.
 *    - Password acak digenerate dan di-update di Supabase Auth.
 *    - Email kedua dikirim dengan password acak tersebut.
 *    - Dibuatkan token PASSWORD_RESET agar user dapat langsung set password baru di web.
 */
export async function verifyEmailTokenAction(token: string): Promise<
  ActionResult<{
    username: string;
    email: string;
    randomPassword: string;
    setupToken: string;
  }>
> {
  try {
    if (!token || typeof token !== "string" || !token.trim()) {
      return {
        success: false,
        code: "INVALID",
        error: "Tautan verifikasi tidak valid. Parameter token tidak ditemukan.",
      };
    }

    const cleanToken = token.trim();
    const tokenRecord = await tokenRepo.getAuthTokenRecord(cleanToken, TokenType.VERIFICATION);

    // Kasus 1: Token tidak ada di database
    if (!tokenRecord) {
      return {
        success: false,
        code: "INVALID",
        error: "Tautan verifikasi tidak valid atau tidak ditemukan.",
      };
    }

    const { token: tokenData, user } = tokenRecord;

    // Kasus 2: Sudah pernah digunakan / diklik (Klik ke-2x)
    if (tokenData.usedAt !== null) {
      return {
        success: false,
        code: "ALREADY_USED",
        error: "Tautan tidak valid karena sudah pernah digunakan untuk verifikasi akun.",
      };
    }

    // Kasus 3: Lebih dari 12 jam (Email Expired)
    const now = new Date();
    if (now > new Date(tokenData.expiresAt)) {
      return {
        success: false,
        code: "EXPIRED",
        error: "Tautan verifikasi telah kedaluwarsa (lebih dari 12 jam). Silakan hubungi Superadmin untuk mengirim ulang email verifikasi.",
      };
    }

    // Kasus 4: Pertama kali dibuka, token valid dan aktif (< 12 jam)
    // 1. Tandai token verifikasi ini sudah dipakai
    await tokenRepo.markAuthTokenUsed(tokenData.id);

    // 2. Ubah status user menjadi verified di DB
    await userRepo.toggleUserStatus(user.id, UserStatus.VERIFIED);

    // 3. Generate password acak yang aman
    const randomPassword = generateRandomPassword(10);

    // 4. Update Supabase Auth (confirm email & update password)
    try {
      const adminClient = createAdminClient();
      await adminClient.auth.admin.updateUserById(user.id, {
        email_confirm: true,
        password: randomPassword,
      });
    } catch (authErr) {
      console.warn("Gagal sinkronisasi konfirmasi ke Supabase Auth:", authErr);
    }

    // 5. Buat token setup password baru (berlaku 12 jam) untuk form update password di web
    const setupToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);

    await tokenRepo.createAuthToken({
      userId: user.id,
      token: setupToken,
      type: TokenType.PASSWORD_RESET,
      expiresAt,
    });

    // 6. Kirim email kedua memuat informasi akun aktif + password acak
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await sendWelcomeWithRandomPasswordEmail({
        to: user.email,
        username: user.username,
        randomPassword,
        setupUrl: `${appUrl}/auth/setup-password?token=${setupToken}`,
      });
    } catch (emailErr) {
      console.warn("Gagal mengirim email welcome password acak:", emailErr);
    }

    return {
      success: true,
      data: {
        username: user.username,
        email: user.email,
        randomPassword,
        setupToken,
      },
      message: "Akun berhasil diverifikasi!",
    };
  } catch (error) {
    console.error("Error verifying email token:", error);
    return {
      success: false,
      code: "INVALID",
      error: error instanceof Error ? error.message : "Gagal memverifikasi akun",
    };
  }
}

/**
 * Submit Password Baru oleh Pengguna (menggunakan Token SETUP / RESET)
 */
export async function submitSetupPasswordAction(
  payload: SetupPasswordInput
): Promise<ActionResult<void>> {
  try {
    const validated = setupPasswordSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi kata sandi gagal",
      };
    }

    const { token, password } = validated.data;

    // Cari token reset/setup di database
    const tokenRecord = await tokenRepo.getAuthTokenRecord(token.trim(), TokenType.PASSWORD_RESET);
    if (!tokenRecord) {
      return {
        success: false,
        code: "INVALID",
        error:
          "Tautan tidak valid atau sesi pembaruan kata sandi tidak ditemukan.",
      };
    }

    const { token: tokenData, user } = tokenRecord;

    if (tokenData.usedAt !== null) {
      return {
        success: false,
        code: "ALREADY_USED",
        error: "Tautan tidak valid karena sudah pernah digunakan untuk memperbarui kata sandi.",
      };
    }

    if (new Date() > new Date(tokenData.expiresAt)) {
      return {
        success: false,
        code: "EXPIRED",
        error: "Tautan pembaruan kata sandi telah kedaluwarsa (lebih dari 12 jam).",
      };
    }

    const adminClient = createAdminClient();

    // Update password di Supabase Auth
    const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Gagal memperbarui kata sandi di Supabase",
      };
    }

    // Tandai token used
    await tokenRepo.markAuthTokenUsed(tokenData.id);

    return {
      success: true,
      data: undefined,
      message: "Kata sandi Anda berhasil diperbarui! Silakan login menggunakan kata sandi baru Anda.",
    };
  } catch (error) {
    console.error("Error submitting new password:", error);
    return {
      success: false,
      code: "INVALID",
      error:
        error instanceof Error ? error.message : "Gagal memperbarui kata sandi",
    };
  }
}


/**
 * Cek apakah token masih valid (untuk preview di form sebelum submit)
 */
export async function checkTokenValidityAction(
  token: string,
  type: TokenType
): Promise<ActionResult<{ username: string; email: string }>> {
  try {
    if (!token || !token.trim()) {
      return {
        success: false,
        code: "INVALID",
        error: "Tautan tidak valid. Parameter token tidak ditemukan.",
      };
    }

    const tokenRecord = await tokenRepo.getAuthTokenRecord(token.trim(), type);
    if (!tokenRecord) {
      return {
        success: false,
        code: "INVALID",
        error: "Tautan tidak valid atau token tidak ditemukan.",
      };
    }

    const { token: tokenData, user } = tokenRecord;

    if (tokenData.usedAt !== null) {
      return {
        success: false,
        code: "ALREADY_USED",
        error: "Tautan ini tidak valid karena sudah pernah digunakan sebelumnya.",
      };
    }

    if (new Date() > new Date(tokenData.expiresAt)) {
      return {
        success: false,
        code: "EXPIRED",
        error: "Tautan ini telah kedaluwarsa (lebih dari 12 jam). Silakan hubungi Superadmin untuk mendapatkan tautan baru.",
      };
    }

    return {
      success: true,
      data: {
        username: user.username,
        email: user.email,
      },
    };
  } catch (err) {
    return {
      success: false,
      code: "INVALID",
      error: err instanceof Error ? err.message : "Gagal memvalidasi token",
    };
  }
}


