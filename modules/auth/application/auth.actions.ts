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
