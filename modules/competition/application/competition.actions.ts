"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api-client";
import {
  competitionFormSchema,
  CompetitionFormInput,
  quickCreateCompetitionSchema,
  QuickCreateCompetitionInput,
} from "../domain/competition.schema";
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

export async function quickCreateCompetitionAction(
  payload: QuickCreateCompetitionInput
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const validated = quickCreateCompetitionSchema.safeParse(payload);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validasi data gagal",
      };
    }

    const res = await apiClient<{ id: string; name: string }>("competitions/quick-create", {
      method: "POST",
      body: JSON.stringify(validated.data),
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal membuat event",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/competition");
    revalidatePath("/dashboard/competition/rundown");
    revalidatePath("/dashboard/competition/bracket");
    revalidatePath("/dashboard/competition/forms");
    revalidatePath("/competition");

    return {
      success: true,
      message: res.message || "Event baru berhasil dibuat!",
      data: res.data,
    };
  } catch (error) {
    console.error("Error quick creating competition:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat event",
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

// Rundown Server Actions
export async function getRundownAction(competitionId: string) {
  try {
    const res = await apiClient<any>(`competitions/${competitionId}/rundown`);
    return {
      success: true,
      data: res.data || null,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengambil data rundown",
    };
  }
}

export async function saveRundownAction(
  competitionId: string,
  payload: { title: string; description?: string | null; items: any[] }
): Promise<ActionResult<any>> {
  try {
    const res = await apiClient<any>(`competitions/${competitionId}/rundown`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal menyimpan rundown",
      };
    }

    revalidatePath("/dashboard/competition/rundown");
    revalidatePath(`/dashboard/competition/${competitionId}/edit`);
    revalidatePath(`/competition/${competitionId}`);

    return {
      success: true,
      message: res.message || "Rundown acara berhasil disimpan!",
      data: res.data,
    };
  } catch (error) {
    console.error("Error saving rundown:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan rundown",
    };
  }
}

export async function deleteRundownAction(
  competitionId: string
): Promise<ActionResult<void>> {
  try {
    const res = await apiClient(`competitions/${competitionId}/rundown`, {
      method: "DELETE",
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal menghapus rundown",
      };
    }

    revalidatePath("/dashboard/competition/rundown");
    revalidatePath(`/dashboard/competition/${competitionId}/edit`);
    revalidatePath(`/competition/${competitionId}`);

    return {
      success: true,
      message: "Rundown acara berhasil dihapus!",
    };
  } catch (error) {
    console.error("Error deleting rundown:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus rundown",
    };
  }
}

// Bracket Server Actions
export async function getBracketAction(competitionId: string) {
  try {
    const res = await apiClient<any>(`competitions/${competitionId}/bracket`);
    return {
      success: true,
      data: res.data || null,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengambil data bracket",
    };
  }
}

export async function saveBracketAction(
  competitionId: string,
  payload: { title: string; type: string; challongeUrl?: string | null; data?: any }
): Promise<ActionResult<any>> {
  try {
    const res = await apiClient<any>(`competitions/${competitionId}/bracket`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal menyimpan bagan pertandingan",
      };
    }

    revalidatePath("/dashboard/competition/bracket");
    revalidatePath(`/dashboard/competition/${competitionId}/edit`);
    revalidatePath(`/competition/${competitionId}`);

    return {
      success: true,
      message: res.message || "Bagan pertandingan berhasil disimpan!",
      data: res.data,
    };
  } catch (error) {
    console.error("Error saving bracket:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan bagan pertandingan",
    };
  }
}

export async function deleteBracketAction(
  competitionId: string
): Promise<ActionResult<void>> {
  try {
    const res = await apiClient(`competitions/${competitionId}/bracket`, {
      method: "DELETE",
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal menghapus bagan pertandingan",
      };
    }

    revalidatePath("/dashboard/competition/bracket");
    revalidatePath(`/dashboard/competition/${competitionId}/edit`);
    revalidatePath(`/competition/${competitionId}`);

    return {
      success: true,
      message: "Bagan pertandingan berhasil dihapus!",
    };
  } catch (error) {
    console.error("Error deleting bracket:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus bagan pertandingan",
    };
  }
}

export async function getVerifiedParticipantsAction(
  competitionId: string
): Promise<ActionResult<any[]>> {
  try {
    const res = await apiClient<any[]>(`competitions/${competitionId}/verified-participants`);
    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal mengambil data peserta terverifikasi",
      };
    }
    return {
      success: true,
      data: res.data || [],
    };
  } catch (error) {
    console.error("Error fetching verified participants:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengambil data peserta",
    };
  }
}



// Form Server Actions
export async function deleteCompetitionFormAction(
  formId: string,
  competitionId: string
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

    revalidatePath(`/dashboard/competition/${competitionId}/edit`);
    revalidatePath(`/dashboard/competition/${competitionId}/form`);

    return {
      success: true,
      message: "Formulir pendaftaran berhasil dihapus!",
    };
  } catch (error) {
    console.error("Error deleting form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus formulir",
    };
  }
}
