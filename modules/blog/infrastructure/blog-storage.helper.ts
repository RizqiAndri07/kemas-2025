import { createAdminClient } from "@/lib/supabase/server";

/**
 * Ekstrak seluruh URL gambar dari tag <img src="..."> di dalam string HTML.
 */
export function extractImageUrlsFromHtml(html: string): string[] {
  if (!html) return [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  const urls: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = imgRegex.exec(html)) !== null) {
    if (match[1]) {
      urls.push(match[1]);
    }
  }

  return Array.from(new Set(urls));
}

/**
 * Ekstrak path relatif file di dalam bucket Supabase dari URL publik.
 * Contoh URL: https://xyz.supabase.co/storage/v1/object/public/blog-bucket/images/123_abc.jpg
 * Hasil: "images/123_abc.jpg"
 */
export function extractStoragePathFromUrl(
  url: string,
  bucketName?: string
): string | null {
  const targetBucket =
    bucketName || process.env.NEXT_PUBLIC_STORAGE_BUCKET_BLOG || "blog-bucket";
  const marker = `/storage/v1/object/public/${targetBucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;

  const rawPath = url.substring(index + marker.length);
  // Hilangkan query parameter jika ada (misal: ?v=123)
  const cleanPath = rawPath.split("?")[0];
  return decodeURIComponent(cleanPath);
}

/**
 * Hapus berkas gambar dari Supabase Storage berdasarkan daftar URL publiknya.
 */
export async function deleteStorageImagesByUrls(urls: string[]): Promise<void> {
  if (!urls || urls.length === 0) return;

  const bucketName =
    process.env.NEXT_PUBLIC_STORAGE_BUCKET_BLOG || "blog-bucket";
  const pathsToDelete: string[] = [];

  for (const url of urls) {
    const path = extractStoragePathFromUrl(url, bucketName);
    if (path) {
      pathsToDelete.push(path);
    }
  }

  if (pathsToDelete.length === 0) return;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from(bucketName)
      .remove(pathsToDelete);

    if (error) {
      console.warn(
        "Peringatan saat menghapus gambar dari Supabase Storage:",
        error.message
      );
    }
  } catch (err) {
    console.warn("Gagal mengeksekusi penghapusan gambar dari storage:", err);
  }
}
