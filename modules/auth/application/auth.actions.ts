"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { apiClient } from "@/lib/api-client";
import { loginSchema, LoginInput, setupPasswordSchema, SetupPasswordInput } from "../domain/auth.schema";
import { TokenType } from "../domain/token-type.enum";
import { ActionResult } from "@/modules/shared/domain/common.types";

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

    const res = await apiClient<{ token: string; user: SessionUserInfo }>("auth/login", {
      method: "POST",
      body: JSON.stringify(validated.data),
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Login gagal diproses",
      };
    }

    // Pasang cookie kp_auth_token di Next.js (berlaku 12 jam)
    const cookieStore = await cookies();
    cookieStore.set("kp_auth_token", res.data.token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 12 * 60 * 60, // 12 jam
      secure: process.env.NODE_ENV === "production",
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/dashboard");
    } catch {
      // Abaikan jika dipanggil di luar HTTP request store Next.js
    }

    return {
      success: true,
      message: res.message || "Login berhasil!",
      data: {
        user: res.data.user,
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
    await apiClient("auth/logout", { method: "POST" });
    const cookieStore = await cookies();
    cookieStore.delete("kp_auth_token");

    try {
      revalidatePath("/", "layout");
      revalidatePath("/dashboard");
    } catch {
      // Abaikan
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
    const res = await apiClient<SessionUserInfo>("auth/me");
    if (!res.success || !res.data) {
      return null;
    }
    return res.data;
  } catch {
    return null;
  }
}

export async function verifyEmailTokenAction(token: string): Promise<
  ActionResult<{
    username: string;
    email: string;
    randomPassword: string;
    setupToken: string;
  }>
> {
  try {
    if (!token || !token.trim()) {
      return {
        success: false,
        code: "INVALID",
        error: "Tautan verifikasi tidak valid. Parameter token tidak ditemukan.",
      };
    }

    const res = await apiClient<{
      username: string;
      email: string;
      randomPassword: string;
      setupToken: string;
    }>("auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token: token.trim() }),
    });

    if (!res.success) {
      return {
        success: false,
        code: (res.code as any) || "INVALID",
        error: res.error || "Gagal memverifikasi akun",
      };
    }

    return {
      success: true,
      message: res.message || "Akun berhasil diverifikasi!",
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      code: "INVALID",
      error: error instanceof Error ? error.message : "Gagal memverifikasi akun",
    };
  }
}

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

    const res = await apiClient("auth/setup-password", {
      method: "POST",
      body: JSON.stringify(validated.data),
    });

    if (!res.success) {
      return {
        success: false,
        code: (res.code as any) || "INVALID",
        error: res.error || "Gagal memperbarui kata sandi",
      };
    }

    return {
      success: true,
      data: undefined,
      message: res.message || "Kata sandi Anda berhasil diperbarui!",
    };
  } catch (error) {
    return {
      success: false,
      code: "INVALID",
      error: error instanceof Error ? error.message : "Gagal memperbarui kata sandi",
    };
  }
}

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

    const res = await apiClient<{ username: string; email: string }>(
      `auth/check-token?token=${encodeURIComponent(token.trim())}&type=${type}`
    );

    if (!res.success || !res.data) {
      return {
        success: false,
        code: (res.code as any) || "INVALID",
        error: res.error || "Tautan ini tidak valid atau telah kedaluwarsa.",
      };
    }

    return {
      success: true,
      data: res.data,
    };
  } catch (err) {
    return {
      success: false,
      code: "INVALID",
      error: err instanceof Error ? err.message : "Gagal memvalidasi token",
    };
  }
}
