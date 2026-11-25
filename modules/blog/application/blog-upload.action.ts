"use server";

import { apiClient } from "@/lib/api-client";
import { ActionResult } from "@/modules/shared/domain/common.types";

export async function uploadBlogImageAction(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  try {
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return {
        success: false,
        error: "Berkas tidak ditemukan dalam permintaan upload.",
      };
    }

    const res = await apiClient<{ url: string }>("blogs/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        error: res.error || "Gagal mengunggah gambar ke server backend",
      };
    }

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("Error uploading blog image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengunggah berkas gambar.",
    };
  }
}
