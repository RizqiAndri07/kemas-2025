"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { ActionResult } from "@/modules/shared/domain/common.types";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // Maksimal 3MB

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

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

    // 1. Validasi Ukuran File (Maksimal 3MB)
    if (file.size > MAX_FILE_SIZE) {
      const currentMb = (file.size / (1024 * 1024)).toFixed(2);
      return {
        success: false,
        error: `Ukuran berkas melebihi batas maksimal 3MB (ukuran saat ini: ${currentMb} MB). Harap pilih berkas yang lebih kecil.`,
      };
    }

    // 2. Validasi Tipe MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error:
          "Format berkas tidak didukung. Harap pilih gambar dengan format PNG, JPG, WebP, GIF, atau SVG.",
      };
    }

    const bucketName =
      process.env.NEXT_PUBLIC_STORAGE_BUCKET_BLOG || "blog-bucket";

    const supabase = createAdminClient();

    // Sanitasi nama berkas & buat path unik
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const uniquePath = `images/${Date.now()}_${cleanFileName}.${fileExt}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(uniquePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return {
        success: false,
        error: `Gagal mengunggah berkas ke storage: ${uploadError.message}. Pastikan bucket "${bucketName}" sudah dibuat di Supabase.`,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniquePath);

    return {
      success: true,
      data: { url: publicUrlData.publicUrl },
      message: "Gambar berhasil diunggah!",
    };
  } catch (error) {
    console.error("Error in uploadBlogImageAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan internal saat memproses upload berkas.",
    };
  }
}
