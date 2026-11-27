"use server";

import { apiClient } from "@/lib/api-client";
import { ActionResult } from "@/modules/shared/domain/common.types";

export interface UploadedDocumentResult {
  url: string;
  fileName: string;
  fileSize: number;
}

export type UploadedGuidebookResult = UploadedDocumentResult;

/**
 * Unggah berkas dokumen kegiatan / buku panduan lomba langsung ke bucket MinIO competition-assets
 */
export async function uploadCompetitionDocumentAction(
  formData: FormData
): Promise<ActionResult<UploadedDocumentResult>> {
  try {
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return {
        success: false,
        error: "Berkas tidak ditemukan dalam permintaan unggah.",
      };
    }

    const res = await apiClient<UploadedDocumentResult>("competitions/upload-document", {
      method: "POST",
      body: formData,
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal mengunggah berkas dokumen ke MinIO.",
      };
    }

    return {
      success: true,
      data: res.data,
      message: res.message || "Berkas berhasil diunggah ke MinIO!",
    };
  } catch (error) {
    console.error("Error uploading competition document to MinIO:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengunggah berkas dokumen.",
    };
  }
}

/**
 * Alias untuk upload guidebook lomba
 */
export const uploadCompetitionGuidebookAction = uploadCompetitionDocumentAction;

/**
 * Hapus berkas dokumen kegiatan dari bucket MinIO competition-assets
 */
export async function deleteCompetitionDocumentAction(
  fileUrl: string | null | undefined
): Promise<ActionResult<void>> {
  if (!fileUrl) {
    return { success: true, data: undefined };
  }

  try {
    const res = await apiClient("competitions/documents/file", {
      method: "DELETE",
      body: JSON.stringify({ fileUrl }),
    });

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Gagal menghapus berkas dokumen dari MinIO.",
      };
    }

    return {
      success: true,
      message: "Berkas berhasil dihapus dari MinIO.",
    };
  } catch (error) {
    console.error("Error deleting competition document from MinIO:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus berkas dokumen.",
    };
  }
}

/**
 * Alias untuk delete guidebook
 */
export const deleteCompetitionGuidebookAction = deleteCompetitionDocumentAction;
