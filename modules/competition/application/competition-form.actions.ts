"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api-client";
import {
  saveCompetitionFormSchema,
  SaveCompetitionFormInput,
} from "../domain/competition-form.schema";
import { CompetitionFormSelect } from "../infrastructure/competition-form.table";
import { ActionResult } from "@/modules/shared/domain/common.types";

export async function createCompetitionFormAction(payload: {
  competitionId: string;
  title: string;
  description?: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const res = await apiClient<{ id: string }>("competitions/forms/save", {
      method: "POST",
      body: JSON.stringify({
        id: crypto.randomUUID(),
        competitionId: payload.competitionId,
        title: payload.title,
        description: payload.description,
        sections: [
          {
            id: "section_identitas",
            title: "Identitas Pendaftar",
            description: "Lengkapi data identitas calon peserta lomba.",
            order: 1,
            fields: [],
          },
        ],
      }),
    });

    revalidatePath("/dashboard/competition/forms");
    return {
      success: true,
      message: res.message || "Formulir berhasil dibuat!",
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat formulir",
    };
  }
}

export async function getCompetitionFormsAction(
  competitionId: string
): Promise<ActionResult<CompetitionFormSelect[]>> {
  try {
    const res = await apiClient<CompetitionFormSelect[]>(`competitions/${competitionId}/forms`);
    return {
      success: true,
      data: res.data || [],
    };
  } catch (error) {
    console.error("Error getting competition forms:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memuat formulir",
    };
  }
}

export async function getCompetitionFormByIdAction(
  formId: string
): Promise<ActionResult<CompetitionFormSelect>> {
  try {
    const res = await apiClient<CompetitionFormSelect>(`competitions/forms/${formId}`);
    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Formulir tidak ditemukan",
      };
    }
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("Error getting competition form by id:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memuat formulir",
    };
  }
}

export async function saveCompetitionFormAction(
  payload: SaveCompetitionFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = saveCompetitionFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi struktur form gagal",
      };
    }

    const res = await apiClient<{ id: string }>("competitions/forms/save", {
      method: "POST",
      body: JSON.stringify(validated.data),
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal menyimpan formulir",
      };
    }

    revalidatePath(`/dashboard/competition/${payload.competitionId}/form`);
    revalidatePath(`/dashboard/competition/${payload.competitionId}/forms`);
    revalidatePath(`/dashboard/competition/forms`);

    return {
      success: true,
      message: res.message || "Struktur formulir pendaftaran berhasil disimpan!",
      data: res.data,
    };
  } catch (error) {
    console.error("Error saving competition form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan formulir",
    };
  }
}

export async function deleteCompetitionFormAction(
  formId: string,
  competitionId?: string
): Promise<ActionResult<void>> {
  try {
    const res = await apiClient(`competitions/forms/${formId}`, {
      method: "DELETE",
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal menghapus formulir",
      };
    }

    revalidatePath(`/dashboard/competition/forms`);

    return {
      success: true,
      data: undefined,
      message: res.message || "Formulir pendaftaran berhasil dihapus!",
    };
  } catch (error) {
    console.error("Error deleting competition form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus formulir",
    };
  }
}

export async function duplicateCompetitionFormAction(
  formId: string,
  competitionId?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const res = await apiClient<{ id: string }>(`competitions/forms/${formId}/duplicate`, {
      method: "POST",
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal menduplikasi formulir",
      };
    }

    revalidatePath(`/dashboard/competition/forms`);

    return {
      success: true,
      message: res.message || "Formulir pendaftaran berhasil diduplikasi!",
      data: res.data,
    };
  } catch (error) {
    console.error("Error duplicating competition form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menduplikasi formulir",
    };
  }
}

export async function setActiveCompetitionFormAction(
  competitionId: string,
  formId: string
): Promise<ActionResult<void>> {
  try {
    const res = await apiClient(`competitions/${competitionId}/forms/${formId}/activate`, {
      method: "PATCH",
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal mengatur formulir aktif",
      };
    }

    revalidatePath(`/dashboard/competition/${competitionId}/forms`);
    revalidatePath(`/dashboard/competition/${competitionId}/edit`);
    revalidatePath(`/dashboard/competition/forms`);

    return {
      success: true,
      data: undefined,
      message: res.message || "Formulir berhasil dipasang sebagai formulir aktif!",
    };
  } catch (error) {
    console.error("Error setting active competition form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengatur formulir aktif",
    };
  }
}
