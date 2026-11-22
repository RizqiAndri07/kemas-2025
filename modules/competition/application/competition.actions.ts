"use server";

import { revalidatePath } from "next/cache";
import { competitionFormSchema, CompetitionFormInput } from "../domain/competition.schema";
import * as competitionRepo from "../infrastructure/competition.repository";
import * as formRepo from "../infrastructure/competition-form.repository";
import { setCompetitionContactPersons, getContactPersonsByCompetitionId } from "../infrastructure/contact-person.repository";
import { ActionResult } from "@/modules/shared/domain/common.types";
import { requireAuthUser } from "@/modules/auth/application/auth.guard";
import { CompetitionStatus } from "../domain/competition-status.enum";
import { deleteGuidebookFile } from "../infrastructure/competition-file.helper";
import {
  setCompetitionDocuments,
  getDocumentsByCompetitionId,
  deleteDocumentsByCompetitionId,
} from "../infrastructure/event-document.repository";

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
      priceList,
      selectedPriceId,
      contactPersonIds,
      guidebookUrl,
      documents,
      description,
      maxQuota,
      noRegistrationNeeded,
      activeFormId,
      status,
    } = validated.data;

    // Sinkronkan nominal fee dengan tier yang sedang terpilih
    const activeTier = priceList?.find((p) => p.id === selectedPriceId);
    const finalFee = activeTier ? activeTier.price : (Number(fee) || 0);

    // Fallback guidebookUrl dari dokumen pertama jika ada
    const resolvedGuidebookUrl = guidebookUrl
      ? guidebookUrl.trim()
      : documents && documents.length > 0
      ? documents[0].filePath.trim()
      : null;

    // 3. Simpan ke Database
    const newComp = await competitionRepo.createCompetition({
      name: name.trim(),
      type,
      registrationStartDate: new Date(registrationStartDate),
      registrationEndDate: new Date(registrationEndDate),
      eventStartDate: new Date(eventStartDate),
      eventEndDate: new Date(eventEndDate),
      fee: finalFee,
      priceList: priceList || [{ id: "default", name: "Normal Price", price: 0 }],
      selectedPriceId: selectedPriceId || "default",
      guidebookUrl: resolvedGuidebookUrl,
      description: description ? description.trim() : null,
      maxQuota: maxQuota ? Number(maxQuota) : null,
      noRegistrationNeeded: Boolean(noRegistrationNeeded),
      activeFormId: activeFormId && activeFormId.trim() !== "" ? activeFormId : null,
      status: status || CompetitionStatus.CLOSED,
    });

    // 4. Simpan Relasi Contact Person jika ada
    if (contactPersonIds) {
      await setCompetitionContactPersons(newComp.id, contactPersonIds);
    }

    // 5. Simpan Dokumen Terkait jika ada
    if (documents && documents.length > 0) {
      await setCompetitionDocuments(newComp.id, documents);
    }

    // 6. Inisialisasi formulir 1:1 jika pendaftaran dibuka
    if (!noRegistrationNeeded) {
      await formRepo.getOrCreateFormByCompetitionId(newComp.id);
    }

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
      priceList,
      selectedPriceId,
      contactPersonIds,
      guidebookUrl,
      documents,
      description,
      maxQuota,
      noRegistrationNeeded,
      activeFormId,
      status,
    } = validated.data;

    // Periksa apakah ada berkas PDF lama yang perlu dibersihkan jika diganti/dihapus
    const existing = await competitionRepo.getCompetitionById(id);
    const targetGuidebookUrl = guidebookUrl
      ? guidebookUrl.trim()
      : documents && documents.length > 0
      ? documents[0].filePath.trim()
      : null;

    if (existing?.guidebookUrl && existing.guidebookUrl !== targetGuidebookUrl) {
      await deleteGuidebookFile(existing.guidebookUrl);
    }

    // Sinkronkan nominal fee dengan tier yang sedang terpilih
    const activeTier = priceList?.find((p) => p.id === selectedPriceId);
    const finalFee = activeTier ? activeTier.price : (Number(fee) || 0);

    // 3. Update Database
    const updated = await competitionRepo.updateCompetition(id, {
      name: name.trim(),
      type,
      registrationStartDate: new Date(registrationStartDate),
      registrationEndDate: new Date(registrationEndDate),
      eventStartDate: new Date(eventStartDate),
      eventEndDate: new Date(eventEndDate),
      fee: finalFee,
      priceList: priceList || [{ id: "default", name: "Normal Price", price: 0 }],
      selectedPriceId: selectedPriceId || "default",
      guidebookUrl: targetGuidebookUrl,
      description: description ? description.trim() : null,
      maxQuota: maxQuota ? Number(maxQuota) : null,
      noRegistrationNeeded: Boolean(noRegistrationNeeded),
      activeFormId: activeFormId && activeFormId.trim() !== "" ? activeFormId : null,
      status,
    });

    if (!updated) {
      return {
        success: false,
        error: "Kompetisi tidak ditemukan",
      };
    }

    // 4. Update Relasi Contact Person jika ada
    if (contactPersonIds) {
      await setCompetitionContactPersons(id, contactPersonIds);
    }

    // 5. Sinkronkan Dokumen Terkait
    if (documents !== undefined) {
      await setCompetitionDocuments(id, documents);
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

    const existing = await competitionRepo.getCompetitionById(id);
    const deleted = await competitionRepo.deleteCompetition(id);
    if (!deleted) {
      return {
        success: false,
        error: "Kompetisi tidak ditemukan atau gagal dihapus",
      };
    }

    // Bersihkan berkas fisik PDF panduan dari folder public jika ada
    if (existing?.guidebookUrl) {
      await deleteGuidebookFile(existing.guidebookUrl);
    }

    // Bersihkan seluruh berkas dokumen kegiatan terkait
    await deleteDocumentsByCompetitionId(id);

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

    // 2. Guard: Jika mengubah status ke OPEN, cek apakah noRegistrationNeeded atau formulir sudah memiliki field
    if (newStatus === CompetitionStatus.OPEN) {
      const existing = await competitionRepo.getCompetitionById(id);
      if (!existing) {
        return {
          success: false,
          error: "Kompetisi tidak ditemukan",
        };
      }
      if (!existing.noRegistrationNeeded) {
        const form = await formRepo.getFormByCompetitionId(id);
        const hasFields = form?.sections?.some(
          (s) => s.fields && s.fields.length > 0
        );
        if (!hasFields) {
          return {
            success: false,
            error:
              "Pendaftaran tidak dapat dibuka (status OPEN) karena formulir pendaftaran belum memiliki field/pertanyaan. Silakan rancang formulir terlebih dahulu atau nyalakan switch 'Tanpa Pendaftaran'.",
          };
        }
      }
    }

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

export async function getCompetitionContactPersonsAction(
  competitionId: string
): Promise<ActionResult<Array<{ id: string; name: string; phone: string }>>> {
  try {
    const cps = await getContactPersonsByCompetitionId(competitionId);
    return {
      success: true,
      data: cps,
    };
  } catch (error) {
    console.error("Error fetching competition contact persons:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memuat contact person kompetisi",
    };
  }
}

export async function getCompetitionDocumentsAction(
  competitionId: string
): Promise<ActionResult<Array<{ id: string; name: string; filePath: string }>>> {
  try {
    const docs = await getDocumentsByCompetitionId(competitionId);
    return {
      success: true,
      data: docs,
    };
  } catch (error) {
    console.error("Error fetching competition documents:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memuat dokumen kompetisi",
    };
  }
}
