"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api-client";
import {
  createUserSchema,
  CreateUserInput,
  updateUserSchema,
  UpdateUserInput,
} from "../domain/user.schema";
import { ActionResult } from "@/modules/shared/domain/common.types";

export async function createUserAction(
  payload: CreateUserInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = createUserSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi gagal",
      };
    }

    const res = await apiClient<{ id: string }>("auth/users", {
      method: "POST",
      body: JSON.stringify(validated.data),
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal menambahkan pengguna",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/users");

    return {
      success: true,
      data: res.data,
      message: res.message || "Pengguna berhasil ditambahkan!",
    };
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
  payload: UpdateUserInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = updateUserSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi gagal",
      };
    }

    const res = await apiClient<{ id: string }>(`auth/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(validated.data),
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal memperbarui pengguna",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/users");

    return {
      success: true,
      data: res.data,
      message: res.message || "Data pengguna berhasil diperbarui!",
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
    const res = await apiClient(`auth/users/${id}`, {
      method: "DELETE",
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal menghapus pengguna",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/users");

    return {
      success: true,
      data: undefined,
      message: res.message || "Pengguna berhasil dihapus!",
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
    const res = await apiClient(`auth/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal memperbarui status pengguna",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/users");

    return {
      success: true,
      data: undefined,
      message: res.message || `Status pengguna berhasil diubah ke ${newStatus}!`,
    };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui status pengguna",
    };
  }
}

export async function resendVerificationEmailAction(
  userId: string
): Promise<ActionResult<void>> {
  try {
    const res = await apiClient(`auth/users/${userId}/resend-verification`, {
      method: "POST",
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal mengirim ulang email verifikasi",
      };
    }

    return {
      success: true,
      data: undefined,
      message: res.message || "Email verifikasi berhasil dikirim ulang (berlaku 12 jam).",
    };
  } catch (error) {
    console.error("Error resending verification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengirim ulang email verifikasi",
    };
  }
}

export async function triggerResetPasswordAction(
  userId: string
): Promise<ActionResult<void>> {
  try {
    const res = await apiClient(`auth/users/${userId}/reset-password`, {
      method: "POST",
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal memproses reset kata sandi",
      };
    }

    return {
      success: true,
      data: undefined,
      message: res.message || "Email reset kata sandi berhasil dikirim (berlaku 12 jam).",
    };
  } catch (error) {
    console.error("Error triggering reset password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memproses reset kata sandi",
    };
  }
}
