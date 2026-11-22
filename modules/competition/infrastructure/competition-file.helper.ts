import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const GUIDEBOOK_DIR = path.join(process.cwd(), "public", "documents", "guidebooks");
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export interface SavedGuidebookResult {
  url: string;
  fileName: string;
  fileSize: number;
}

/**
 * Menyimpan berkas PDF panduan / rulebook ke folder public/documents/guidebooks/
 * dengan nama file acak (UUID) untuk mencegah benturan nama & menjaga keamanan URL.
 */
export async function saveGuidebookFile(file: File): Promise<SavedGuidebookResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran berkas melebihi batas maksimal 2MB.");
  }

  // Pastikan direktori tujuan tersedia
  await fs.mkdir(GUIDEBOOK_DIR, { recursive: true });

  // Generate nama unik menggunakan UUID acak
  const randomId = crypto.randomUUID();
  const safeExtension = "pdf";
  const uniqueFileName = `${randomId}.${safeExtension}`;
  const targetFilePath = path.join(GUIDEBOOK_DIR, uniqueFileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(targetFilePath, buffer);

  const relativeUrl = `/documents/guidebooks/${uniqueFileName}`;

  return {
    url: relativeUrl,
    fileName: file.name,
    fileSize: file.size,
  };
}

/**
 * Menghapus berkas PDF panduan dari folder public/documents/guidebooks/
 * Dilengkapi dengan validasi ketat path traversal.
 */
export async function deleteGuidebookFile(fileUrl: string | null | undefined): Promise<void> {
  if (!fileUrl) return;

  const normalizedUrl = fileUrl.trim();

  // Validasi keamanan: hanya mengizinkan path yang berawalan /documents/guidebooks/
  if (!normalizedUrl.startsWith("/documents/guidebooks/")) {
    return;
  }

  const baseFileName = path.basename(normalizedUrl);

  // Mencegah path traversal dan hanya memproses ekstensi .pdf
  if (!baseFileName || baseFileName.includes("..") || !baseFileName.toLowerCase().endsWith(".pdf")) {
    return;
  }

  const fullPath = path.join(GUIDEBOOK_DIR, baseFileName);

  try {
    await fs.unlink(fullPath);
  } catch (error: unknown) {
    // Abaikan jika berkas memang sudah tidak ada (ENOENT)
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "ENOENT") {
      return;
    }
    console.warn("Peringatan saat menghapus berkas panduan fisik:", error);
  }
}
