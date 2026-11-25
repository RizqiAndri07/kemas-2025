"use server";

import { apiClient } from "@/lib/api-client";
import { ActionResult } from "@/modules/shared/domain/common.types";

export interface UploadedGuidebookResult {
  url: string;
  fileName: string;
  fileSize: number;
}

export async function uploadCompetitionGuidebookAction(
  formData: FormData
): Promise<ActionResult<UploadedGuidebookResult>> {
  try {
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return {
        success: false,
        error: "Berkas tidak ditemukan dalam permintaan unggah.",
      };
    }

    const res = await apiClient<UploadedGuidebookResult>("competitions/upload-guidebook", {
      method: "POST",
      body: formData,
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal mengunggah berkas panduan.",
      };
    }

    return {
      success: true,
      data: res.data,
      message: res.message || "Berkas panduan berhasil diunggah!",
    };
  } catch (error) {
    console.error("Error uploading competition guidebook:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengunggah berkas panduan.",
    };
  }
}

export async function deleteCompetitionGuidebookAction(
  fileUrl: string | null | undefined
): Promise<ActionResult<void>> {
  return {
    success: true,
    data: undefined,
  };
}
