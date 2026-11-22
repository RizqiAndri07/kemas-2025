"use server";

import { revalidatePath } from "next/cache";
import {
  createCompetitionFormMetaSchema,
  saveCompetitionFormSchema,
  CreateCompetitionFormMetaInput,
  SaveCompetitionFormInput,
} from "../domain/competition-form.schema";
import * as formRepo from "../infrastructure/competition-form.repository";
import * as competitionRepo from "../infrastructure/competition.repository";
import { ActionResult } from "@/modules/shared/domain/common.types";
import { requireAuthUser } from "@/modules/auth/application/auth.guard";
import { CompetitionFormSelect } from "../infrastructure/competition-form.table";

/**
 * Mengambil semua formulir milik suatu kompetisi
 */
export async function getCompetitionFormsAction(
  competitionId: string
): Promise<ActionResult<CompetitionFormSelect[]>> {
  try {
    await requireAuthUser();
    const forms = await formRepo.getFormsByCompetitionId(competitionId);
    return {
      success: true,
      data: forms,
    };
  } catch (error) {
    console.error("Error fetching competition forms:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memuat formulir kompetisi",
    };
  }
}

/**
 * Mengambil detail satu formulir berdasarkan ID
 */
export async function getCompetitionFormByIdAction(
  id: string
): Promise<ActionResult<CompetitionFormSelect | null>> {
  try {
    await requireAuthUser();
    const form = await formRepo.getFormById(id);
    return {
      success: true,
      data: form,
    };
  } catch (error) {
    console.error("Error fetching form by id:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memuat data formulir",
    };
  }
}

/**
 * Membuat formulir baru untuk kompetisi (metadata awal)
 */
export async function createCompetitionFormAction(
  payload: CreateCompetitionFormMetaInput
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAuthUser();

    const validated = createCompetitionFormMetaSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi formulir gagal",
      };
    }

    const { competitionId, title, description } = validated.data;

    // Buat formulir baru dengan section default
    const newForm = await formRepo.createCompetitionForm({
      competitionId,
      title: title.trim(),
      description: description ? description.trim() : null,
      sections: [
        {
          id: "sec_default",
          title: "Informasi Pendaftaran",
          description: "Silakan lengkapi data pendaftaran di bawah ini.",
          order: 0,
          fields: [],
        },
      ],
    });

    // Jika kompetisi belum memiliki activeFormId dan noRegistrationNeeded == false, set otomatis form ini sebagai activeForm
    const comp = await competitionRepo.getCompetitionById(competitionId);
    if (comp && !comp.activeFormId && !comp.noRegistrationNeeded) {
      await competitionRepo.setActiveForm(competitionId, newForm.id);
    }

    try {
      revalidatePath(`/dashboard/competition/${competitionId}`);
      revalidatePath(`/dashboard/competition/${competitionId}/forms`);
      revalidatePath(`/dashboard/competition/${competitionId}/edit`);
    } catch {
      // Abaikan di luar HTTP context
    }

    return {
      success: true,
      data: { id: newForm.id },
      message: `Formulir "${newForm.title}" berhasil dibuat!`,
    };
  } catch (error) {
    console.error("Error creating competition form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat formulir pendaftaran",
    };
  }
}

/**
 * Menyimpan seluruh konfigurasi formulir (sections, fields, validations)
 */
export async function saveCompetitionFormAction(
  payload: SaveCompetitionFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAuthUser();

    const validated = saveCompetitionFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi struktur form gagal",
      };
    }

    const { id, competitionId, title, description, sections } = validated.data;

    const updated = await formRepo.updateCompetitionForm(id, {
      title: title.trim(),
      description: description ? description.trim() : null,
      sections,
    });

    if (!updated) {
      return {
        success: false,
        error: "Formulir tidak ditemukan atau gagal diperbarui",
      };
    }

    try {
      revalidatePath(`/dashboard/competition/${competitionId}/forms`);
      revalidatePath(`/dashboard/competition/${competitionId}/forms/${id}`);
      revalidatePath(`/competition/${competitionId}/register`);
    } catch {
      // Abaikan di luar HTTP context
    }

    return {
      success: true,
      data: { id: updated.id },
      message: "Formulir pendaftaran berhasil disimpan!",
    };
  } catch (error) {
    console.error("Error saving competition form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan formulir pendaftaran",
    };
  }
}

/**
 * Menghapus formulir
 */
export async function deleteCompetitionFormAction(
  id: string,
  competitionId: string
): Promise<ActionResult<void>> {
  try {
    await requireAuthUser();

    const deleted = await formRepo.deleteCompetitionForm(id);
    if (!deleted) {
      return {
        success: false,
        error: "Formulir tidak ditemukan atau gagal dihapus",
      };
    }

    try {
      revalidatePath(`/dashboard/competition/${competitionId}`);
      revalidatePath(`/dashboard/competition/${competitionId}/forms`);
      revalidatePath(`/dashboard/competition/${competitionId}/edit`);
    } catch {
      // Abaikan di luar HTTP context
    }

    return {
      success: true,
      data: undefined,
      message: "Formulir pendaftaran berhasil dihapus!",
    };
  } catch (error) {
    console.error("Error deleting competition form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus formulir pendaftaran",
    };
  }
}

/**
 * Menduplikasi formulir yang sudah ada
 */
export async function duplicateCompetitionFormAction(
  id: string,
  competitionId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAuthUser();

    const duplicated = await formRepo.duplicateCompetitionForm(id);
    if (!duplicated) {
      return {
        success: false,
        error: "Gagal menduplikasi formulir",
      };
    }

    try {
      revalidatePath(`/dashboard/competition/${competitionId}`);
      revalidatePath(`/dashboard/competition/${competitionId}/forms`);
    } catch {
      // Abaikan di luar HTTP context
    }

    return {
      success: true,
      data: { id: duplicated.id },
      message: `Formulir "${duplicated.title}" berhasil diduplikasi!`,
    };
  } catch (error) {
    console.error("Error duplicating competition form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menduplikasi formulir",
    };
  }
}

/**
 * Mengubah formulir aktif untuk pendaftaran kompetisi
 */
export async function setActiveCompetitionFormAction(
  competitionId: string,
  formId: string | null
): Promise<ActionResult<void>> {
  try {
    await requireAuthUser();

    const updated = await competitionRepo.setActiveForm(competitionId, formId);
    if (!updated) {
      return {
        success: false,
        error: "Kompetisi tidak ditemukan",
      };
    }

    try {
      revalidatePath(`/dashboard/competition/${competitionId}`);
      revalidatePath(`/dashboard/competition/${competitionId}/forms`);
      revalidatePath(`/dashboard/competition/${competitionId}/edit`);
      revalidatePath("/dashboard/competition");
    } catch {
      // Abaikan di luar HTTP context
    }

    return {
      success: true,
      data: undefined,
      message: formId
        ? "Formulir berhasil ditetapkan sebagai formulir pendaftaran aktif!"
        : "Formulir pendaftaran aktif telah dikosongkan.",
    };
  } catch (error) {
    console.error("Error setting active form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengatur formulir aktif",
    };
  }
}
