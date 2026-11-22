"use server";

import { revalidatePath } from "next/cache";
import { competitionFormSchema, CompetitionFormInput } from "../domain/competition.schema";
import * as competitionRepo from "../infrastructure/competition.repository";
import { ActionResult } from "@/modules/shared/domain/common.types";
import { requireAuthUser } from "@/modules/auth/application/auth.guard";
import { CompetitionStatus } from "../domain/competition-status.enum";

export async function createCompetitionAction(
  payload: CompetitionFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Proteksi Autentikasi Admin
    await requireAuthUser();

    // 2. Validasi Input Zod
    const validated = competitionFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi data gagal",
      };
    }

    const {
      name,
      type,
      registrationStartDate,
      registrationEndDate,
      eventStartDate,
      eventEndDate,
      fee,
      description,
      maxQuota,
      status,
    } = validated.data;

    // 3. Simpan ke Database
    const newComp = await competitionRepo.createCompetition({
      name: name.trim(),
      type,
      registrationStartDate: new Date(registrationStartDate),
      registrationEndDate: new Date(registrationEndDate),
      eventStartDate: new Date(eventStartDate),
      eventEndDate: new Date(eventEndDate),
      fee: Number(fee) || 0,
      description: description ? description.trim() : null,
      maxQuota: maxQuota ? Number(maxQuota) : null,
      status: status || CompetitionStatus.OPEN,
    });

    try {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/competition");
    } catch {
      // Abaikan jika dipanggil di luar HTTP context
    }

    return {
      success: true,
      data: { id: newComp.id },
      message: `Kompetisi "${newComp.name}" berhasil dibuat!`,
    };
  } catch (error) {
    console.error("Error creating competition:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menambahkan kompetisi",
    };
  }
}

export async function updateCompetitionAction(
  id: string,
  payload: CompetitionFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Proteksi Autentikasi Admin
    await requireAuthUser();

    // 2. Validasi Input Zod
    const validated = competitionFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi data gagal",
      };
    }

    const {
      name,
      type,
      registrationStartDate,
      registrationEndDate,
      eventStartDate,
      eventEndDate,
      fee,
      description,
      maxQuota,
      status,
    } = validated.data;

    // 3. Update Database
    const updated = await competitionRepo.updateCompetition(id, {
      name: name.trim(),
      type,
      registrationStartDate: new Date(registrationStartDate),
      registrationEndDate: new Date(registrationEndDate),
      eventStartDate: new Date(eventStartDate),
      eventEndDate: new Date(eventEndDate),
      fee: Number(fee) || 0,
      description: description ? description.trim() : null,
      maxQuota: maxQuota ? Number(maxQuota) : null,
      status,
    });

    if (!updated) {
      return {
        success: false,
        error: "Kompetisi tidak ditemukan",
      };
    }

    try {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/competition");
      revalidatePath(`/dashboard/competition/${id}/edit`);
    } catch {
      // Abaikan jika dipanggil di luar HTTP context
    }

    return {
      success: true,
      data: { id: updated.id },
      message: `Data kompetisi "${updated.name}" berhasil diperbarui!`,
    };
  } catch (error) {
    console.error("Error updating competition:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui kompetisi",
    };
  }
}

export async function deleteCompetitionAction(id: string): Promise<ActionResult<void>> {
  try {
    // 1. Proteksi Autentikasi Admin
    await requireAuthUser();

    const deleted = await competitionRepo.deleteCompetition(id);
    if (!deleted) {
      return {
        success: false,
        error: "Kompetisi tidak ditemukan atau gagal dihapus",
      };
    }

    try {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/competition");
    } catch {
      // Abaikan jika dipanggil di luar HTTP context
    }

    return {
      success: true,
      data: undefined,
      message: "Kompetisi berhasil dihapus!",
    };
  } catch (error) {
    console.error("Error deleting competition:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus kompetisi",
    };
  }
}

export async function toggleCompetitionStatusAction(
  id: string,
  newStatus: CompetitionStatus
): Promise<ActionResult<void>> {
  try {
    // 1. Proteksi Autentikasi Admin
    await requireAuthUser();

    const updated = await competitionRepo.toggleCompetitionStatus(id, newStatus);
    if (!updated) {
      return {
        success: false,
        error: "Kompetisi tidak ditemukan",
      };
    }

    try {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/competition");
    } catch {
      // Abaikan jika dipanggil di luar HTTP context
    }

    const label = newStatus === CompetitionStatus.OPEN ? "Dibuka" : "Ditutup";
    return {
      success: true,
      data: undefined,
      message: `Status pendaftaran kompetisi berhasil diubah menjadi ${label}!`,
    };
  } catch (error) {
    console.error("Error toggling competition status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengubah status kompetisi",
    };
  }
}
