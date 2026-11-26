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

    const apiUrl =
      process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api";

    // 1. Coba login melalui endpoint Better Auth
    const authRes = await fetch(`${apiUrl}/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: validated.data.email.trim().toLowerCase(),
        password: validated.data.password,
      }),
      cache: "no-store",
    });

    if (authRes.ok) {
      const data = await authRes.json();
      const token = data.token;
      const user = data.user;

      const cookieStore = await cookies();
      const isProd = process.env.NODE_ENV === "production";

      // Simpan session cookie Better Auth (7 hari)
      cookieStore.set("better-auth.session_token", token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        secure: isProd,
      });

      // Simpan kp_auth_token untuk backward compatibility
      cookieStore.set("kp_auth_token", token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        secure: isProd,
      });

      try {
        revalidatePath("/", "layout");
        revalidatePath("/dashboard");
      } catch {
        // Abaikan
      }

      return {
        success: true,
        message: "Login berhasil!",
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username || user.name || "user",
            role: user.role || "ADMIN",
          },
        },
      };
    }

    // 2. Fallback: Coba login melalui endpoint /auth/login legacy bila diperlukan
    const legacyRes = await apiClient<{ token: string; user: SessionUserInfo }>("auth/login", {
      method: "POST",
      body: JSON.stringify(validated.data),
    });

    if (!legacyRes.success || !legacyRes.data) {
      // Ambil pesan error dari Better Auth jika ada
      let errorMsg = legacyRes.error || "Login gagal diproses";
      try {
        const errJson = await authRes.json();
        if (errJson.message || errJson.error) {
          errorMsg = errJson.message || errJson.error;
        }
      } catch {}

      return {
        success: false,
        error: errorMsg,
      };
    }

    // Pasang cookie kp_auth_token di Next.js
    const cookieStore = await cookies();
    cookieStore.set("kp_auth_token", legacyRes.data.token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 12 * 60 * 60,
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
      message: legacyRes.message || "Login berhasil!",
      data: {
        user: legacyRes.data.user,
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
    const cookieStore = await cookies();
    const token =
      cookieStore.get("better-auth.session_token")?.value ||
      cookieStore.get("kp_auth_token")?.value;

    const apiUrl =
      process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api";

    if (token) {
      await fetch(`${apiUrl}/auth/sign-out`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `better-auth.session_token=${token}`,
        },
        cache: "no-store",
      }).catch(() => {});
    }

    await apiClient("auth/logout", { method: "POST" }).catch(() => {});

    cookieStore.delete("better-auth.session_token");
    cookieStore.delete("__Secure-better-auth.session_token");
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
    const cookieStore = await cookies();
    const token =
      cookieStore.get("better-auth.session_token")?.value ||
      cookieStore.get("kp_auth_token")?.value;

    if (!token) return null;

    const apiUrl =
      process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api";

    const sessionRes = await fetch(`${apiUrl}/auth/get-session`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `better-auth.session_token=${token}`,
      },
      cache: "no-store",
    });

    if (sessionRes.ok) {
      const data = await sessionRes.json();
      if (data && data.user) {
        return {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username || data.user.name || "user",
          role: data.user.role || "ADMIN",
        };
      }
    }

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
