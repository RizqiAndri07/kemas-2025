"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api-client";
import {
  updateRegistrationStatusSchema,
  UpdateRegistrationStatusInput,
} from "../domain/registration.schema";
import { ActionResult } from "@/modules/shared/domain/common.types";

export async function updateRegistrationStatusAction(
  payload: UpdateRegistrationStatusInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const parseResult = updateRegistrationStatusSchema.safeParse(payload);
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || "Input tidak valid",
      };
    }

    const { id, status, notes } = parseResult.data;

    const res = await apiClient<{ id: string }>(`registrations/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal memperbarui status verifikasi",
      };
    }

    revalidatePath("/dashboard/registrations");

    return {
      success: true,
      message: res.message || `Status pendaftaran berhasil diubah menjadi ${status}`,
      data: res.data,
    };
  } catch (error) {
    console.error("Error updating registration status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui status",
    };
  }
}

export async function deleteRegistrationAction(
  id: string
): Promise<ActionResult<void>> {
  try {
    const res = await apiClient(`registrations/${id}`, {
      method: "DELETE",
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal menghapus data pendaftaran",
      };
    }

    revalidatePath("/dashboard/registrations");

    return {
      success: true,
      message: res.message || "Data pendaftaran berhasil dihapus!",
    };
  } catch (error) {
    console.error("Error deleting registration:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus pendaftaran",
    };
  }
}

export async function submitRegistrationAction(
  formData: FormData
): Promise<ActionResult<{ id: string; registrationNumber: string }>> {
  try {
    const res = await apiClient<{ id: string; registrationNumber: string }>("registrations", {
      method: "POST",
      body: formData,
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Pendaftaran gagal dikirim.",
      };
    }

    revalidatePath("/dashboard/registrations");

    return {
      success: true,
      message: res.message || "Pendaftaran berhasil dikirim!",
      data: res.data,
    };
  } catch (error) {
    console.error("Error submitting registration:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan saat mengirim pendaftaran",
    };
  }
}
