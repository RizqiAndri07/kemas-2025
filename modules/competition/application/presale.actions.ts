"use server";

import { revalidatePath } from "next/cache";
import { presaleFormSchema, PresaleFormInput } from "../domain/presale.schema";
import * as presaleRepo from "../infrastructure/competition-presale.repository";
import { ActionResult } from "@/modules/shared/domain/common.types";
import { requireAuthUser } from "@/modules/auth/application/auth.guard";

export async function createPresaleAction(
  payload: PresaleFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Proteksi Autentikasi Admin
    await requireAuthUser();

    // 2. Validasi Zod
    const validated = presaleFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi data presale gagal",
      };
    }

    const { competitionId, name, price, startDate, endDate, quota, isActive } = validated.data;

    const newPresale = await presaleRepo.createPresale({
      competitionId,
      name: name.trim(),
      price: Number(price),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      quota: quota ? Number(quota) : null,
      isActive: isActive ?? true,
    });

    try {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/competition");
      revalidatePath("/dashboard/competition/presale");
    } catch {
      // Abaikan jika dipanggil di luar HTTP context
    }

    return {
      success: true,
      data: { id: newPresale.id },
      message: `Gelombang "${newPresale.name}" berhasil ditambahkan!`,
    };
  } catch (error) {
    console.error("Error creating presale:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menambahkan gelombang presale",
    };
  }
}

export async function updatePresaleAction(
  id: string,
  payload: PresaleFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Proteksi Autentikasi Admin
    await requireAuthUser();

    // 2. Validasi Zod
    const validated = presaleFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi data presale gagal",
      };
    }

    const { competitionId, name, price, startDate, endDate, quota, isActive } = validated.data;

    const updated = await presaleRepo.updatePresale(id, {
      competitionId,
      name: name.trim(),
      price: Number(price),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      quota: quota ? Number(quota) : null,
      isActive,
    });

    if (!updated) {
      return {
        success: false,
        error: "Gelombang presale tidak ditemukan",
      };
    }

    try {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/competition");
      revalidatePath("/dashboard/competition/presale");
    } catch {
      // Abaikan jika dipanggil di luar HTTP context
    }

    return {
      success: true,
      data: { id: updated.id },
      message: `Gelombang "${updated.name}" berhasil diperbarui!`,
    };
  } catch (error) {
    console.error("Error updating presale:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui gelombang presale",
    };
  }
}

export async function deletePresaleAction(id: string): Promise<ActionResult<void>> {
  try {
    // 1. Proteksi Autentikasi Admin
    await requireAuthUser();

    const deleted = await presaleRepo.deletePresale(id);
    if (!deleted) {
      return {
        success: false,
        error: "Gelombang presale tidak ditemukan atau gagal dihapus",
      };
    }

    try {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/competition");
      revalidatePath("/dashboard/competition/presale");
    } catch {
      // Abaikan jika dipanggil di luar HTTP context
    }

    return {
      success: true,
      data: undefined,
      message: "Gelombang presale berhasil dihapus!",
    };
  } catch (error) {
    console.error("Error deleting presale:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus gelombang presale",
    };
  }
}

export async function togglePresaleStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult<void>> {
  try {
    // 1. Proteksi Autentikasi Admin
    await requireAuthUser();

    const updated = await presaleRepo.togglePresaleStatus(id, isActive);
    if (!updated) {
      return {
        success: false,
        error: "Gelombang presale tidak ditemukan",
      };
    }

    try {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/competition");
      revalidatePath("/dashboard/competition/presale");
    } catch {
      // Abaikan jika dipanggil di luar HTTP context
    }

    return {
      success: true,
      data: undefined,
      message: `Status presale diubah menjadi ${isActive ? "Aktif" : "Nonaktif"}!`,
    };
  } catch (error) {
    console.error("Error toggling presale status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui status presale",
    };
  }
}
