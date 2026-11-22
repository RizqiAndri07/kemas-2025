"use client";

import { useEffect, useRef, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { cn } from "@/lib/utils";

export interface BlockNoteEditorProps {
  initialContent?: string;
  onChange: (html: string) => void;
  onFileCached?: (blobUrl: string, file: File) => void;
  editable?: boolean;
  className?: string;
}

export function BlockNoteEditor({
  initialContent,
  onChange,
  onFileCached,
  editable = true,
  className,
}: BlockNoteEditorProps) {
  const isLoadedRef = useRef(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Deteksi dan sinkronisasi reaktif dengan theme mode sistem (light / dark)
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Fungsi upload handler untuk berkas lokal (gambar/media)
  const handleUploadFile = async (file: File): Promise<string> => {
    // 1. Validasi ukuran file di sisi client (maksimal 3MB)
    const MAX_SIZE = 3 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const currentMb = (file.size / (1024 * 1024)).toFixed(2);
      throw new Error(`Ukuran file (${currentMb} MB) melebihi batas maksimal 3MB`);
    }

    // 2. Validasi tipe file
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Format file tidak didukung. Harap pilih gambar (PNG, JPG, WebP, GIF, SVG)"
      );
    }

    // 3. Deferred Upload: Simpan berkas di cache lokal dan buat Object URL untuk instant preview
    const blobUrl = URL.createObjectURL(file);
    if (onFileCached) {
      onFileCached(blobUrl, file);
    }

    return blobUrl;
  };

  // Inisialisasi editor BlockNote dengan hook useCreateBlockNote dan uploadFile callback
  const editor = useCreateBlockNote({
    uploadFile: handleUploadFile,
  });

  // Muat konten awal dari HTML (jika ada) saat pertama kali dimount
  useEffect(() => {
    if (!editor || !initialContent || isLoadedRef.current) return;
    isLoadedRef.current = true;

    try {
      const blocks = editor.tryParseHTMLToBlocks(initialContent);
      if (blocks && blocks.length > 0) {
        editor.replaceBlocks(editor.document, blocks);
      }
    } catch (err) {
      console.error("Gagal mengurai HTML awal ke blok dokumen BlockNote:", err);
    }
  }, [editor, initialContent]);

  // Ekspor dokumen ke format HTML setiap kali konten berubah
  const handleEditorChange = () => {
    if (!editor) return;
    try {
      const html = editor.blocksToHTMLLossy(editor.document);
      onChange(html);
    } catch (err) {
      console.error("Gagal mengekspor dokumen BlockNote ke HTML:", err);
    }
  };

  return (
    <div className={cn("blocknote-wrapper w-full bg-transparent text-foreground", className)}>
      <BlockNoteView
        editor={editor}
        onChange={handleEditorChange}
        editable={editable}
        theme={theme}
        className="min-h-[500px] w-full bg-transparent"
      />
    </div>
  );
}

export default BlockNoteEditor;
