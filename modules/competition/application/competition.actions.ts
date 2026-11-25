"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api-client";
import { competitionFormSchema, CompetitionFormInput } from "../domain/competition.schema";
import { ActionResult } from "@/modules/shared/domain/common.types";
import { CompetitionStatus } from "../domain/competition-status.enum";
import { ContactPersonSelect } from "../infrastructure/contact-person.table";
import { EventDocumentSelect } from "../infrastructure/event-document.table";

export async function createCompetitionAction(
  payload: CompetitionFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = competitionFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi data gagal",
      };
    }

    const res = await apiClient<{ id: string }>("competitions", {
      method: "POST",
      body: JSON.stringify(validated.data),
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal membuat kompetisi",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/competition");
    revalidatePath("/competition");

    return {
      success: true,
      message: res.message || "Kompetisi berhasil dibuat!",
      data: res.data,
    };
  } catch (error) {
    console.error("Error creating competition:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat kompetisi",
    };
  }
}

export async function updateCompetitionAction(
  id: string,
  payload: CompetitionFormInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = competitionFormSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi data gagal",
      };
    }

    const res = await apiClient<{ id: string }>(`competitions/${id}`, {
      method: "PUT",
      body: JSON.stringify(validated.data),
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal memperbarui kompetisi",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/competition");
    revalidatePath(`/dashboard/competition/${id}/edit`);
    revalidatePath(`/competition/${id}`);
    revalidatePath("/competition");

    return {
      success: true,
      message: res.message || "Kompetisi berhasil diperbarui!",
      data: res.data,
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
    const res = await apiClient(`competitions/${id}`, {
      method: "DELETE",
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal menghapus kompetisi",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/competition");
    revalidatePath("/competition");

    return {
      success: true,
      data: undefined,
      message: res.message || "Kompetisi berhasil dihapus!",
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
): Promise<ActionResult<{ id: string; status: CompetitionStatus }>> {
  try {
    const res = await apiClient<{ id: string; status: CompetitionStatus }>(`competitions/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal mengubah status kompetisi",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/competition");
    revalidatePath(`/dashboard/competition/${id}/edit`);
    revalidatePath(`/competition/${id}`);
    revalidatePath("/competition");

    return {
      success: true,
      message: res.message || `Status kompetisi berhasil diubah ke ${newStatus}!`,
      data: res.data,
    };
  } catch (error) {
    console.error("Error toggling competition status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengubah status kompetisi",
    };
  }
}

export async function getCompetitionContactPersonsAction(
  competitionId: string
): Promise<ContactPersonSelect[]> {
  try {
    const res = await apiClient<any>(`competitions/${competitionId}`);
    return res.data?.contactPersons || [];
  } catch (error) {
    console.error("Error fetching competition contact persons:", error);
    return [];
  }
}

export async function getCompetitionDocumentsAction(
  competitionId: string
): Promise<EventDocumentSelect[]> {
  try {
    const res = await apiClient<any>(`competitions/${competitionId}`);
    return res.data?.documents || [];
  } catch (error) {
    console.error("Error fetching competition documents:", error);
    return [];
  }
}
