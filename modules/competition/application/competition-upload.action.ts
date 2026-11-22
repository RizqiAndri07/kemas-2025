"use server";

import { requireAuthUser } from "@/modules/auth/application/auth.guard";
import { ActionResult } from "@/modules/shared/domain/common.types";
import {
  saveGuidebookFile,
  deleteGuidebookFile,
  SavedGuidebookResult,
} from "../infrastructure/competition-file.helper";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function uploadCompetitionGuidebookAction(
  formData: FormData
): Promise<ActionResult<SavedGuidebookResult>> {
  try {
    // 1. Proteksi Autentikasi Pengguna Admin
    await requireAuthUser();

    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return {
        success: false,
        error: "Berkas PDF tidak ditemukan dalam permintaan unggah.",
      };
    }

    // 2. Validasi Format Berkas (PDF saja)
    const isPdfMime = file.type === "application/pdf";
    const isPdfExt = file.name.toLowerCase().endsWith(".pdf");

    if (!isPdfMime && !isPdfExt) {
      return {
        success: false,
        error: "Format berkas tidak valid. Harap pilih berkas dokumen berformat PDF (.pdf).",
      };
    }

    // 3. Validasi Ukuran Berkas (Maksimal 2MB)
    if (file.size > MAX_FILE_SIZE) {
      const currentSizeMb = (file.size / (1024 * 1024)).toFixed(2);
      return {
        success: false,
        error: `Ukuran berkas melebihi batas maksimal 2MB (ukuran saat ini: ${currentSizeMb} MB). Harap pilih berkas yang lebih kecil.`,
      };
    }

    // 4. Simpan ke direktori publik lokal
    const result = await saveGuidebookFile(file);

    return {
      success: true,
      data: result,
      message: "Buku panduan PDF berhasil diunggah!",
    };
  } catch (error) {
    console.error("Error saat mengunggah buku panduan kompetisi:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan internal saat memproses unggah buku panduan.",
    };
  }
}

export async function deleteCompetitionGuidebookAction(
  fileUrl: string
): Promise<ActionResult<void>> {
  try {
    // 1. Proteksi Autentikasi Pengguna Admin
    await requireAuthUser();

    if (!fileUrl) {
      return {
        success: false,
        error: "URL berkas tidak valid.",
      };
    }

    await deleteGuidebookFile(fileUrl);

    return {
      success: true,
      message: "Berkas panduan PDF berhasil dihapus.",
    };
  } catch (error) {
    console.error("Error saat menghapus berkas panduan kompetisi:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal menghapus berkas panduan PDF.",
    };
  }
}
