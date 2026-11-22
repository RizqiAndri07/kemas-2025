"use client";

import { useState, useRef, useTransition } from "react";
import {
  FileText,
  UploadCloud,
  X,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import {
  uploadCompetitionGuidebookAction,
  deleteCompetitionGuidebookAction,
} from "../../application/competition-upload.action";

interface CompetitionGuidebookUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export function CompetitionGuidebookUploader({
  value,
  onChange,
  disabled = false,
}: CompetitionGuidebookUploaderProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (file: File) => {
    setErrorMessage(null);

    // 1. Validasi Tipe Berkas (PDF)
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      const msg = "Format berkas tidak valid. Harap pilih dokumen berformat PDF (.pdf).";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // 2. Validasi Ukuran (Maksimal 2MB)
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      const msg = `Ukuran berkas melebihi batas 2MB (ukuran: ${sizeMb} MB). Silakan perkecil atau pilih berkas lain.`;
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // 3. Upload Berkas ke Server
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadCompetitionGuidebookAction(formData);

        if (!res.success) {
          const errText = res.error || "Gagal mengunggah berkas PDF.";
          setErrorMessage(errText);
          toast.error(errText);
          return;
        }

        if (!res.data) {
          const errText = "Data berkas tidak diterima dari server.";
          setErrorMessage(errText);
          toast.error(errText);
          return;
        }

        // Jika sebelumnya sudah ada berkas lama yang berbeda, hapus berkas lama
        if (value && value !== res.data.url) {
          try {
            await deleteCompetitionGuidebookAction(value);
          } catch {
            // Non-blocking error
          }
        }

        onChange(res.data.url);
        toast.success("Buku panduan PDF berhasil diunggah.");
      } catch (err) {
        const errText =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memproses unggahan berkas.";
        setErrorMessage(errText);
        toast.error(errText);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
    // Reset nilai input agar dapat memilih file yang sama jika diinginkan
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isPending) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleRemove = () => {
    if (disabled || isPending) return;

    const currentUrl = value;
    onChange(null);
    setErrorMessage(null);
    toast.info("Buku panduan PDF dihapus.");

    if (currentUrl) {
      startTransition(async () => {
        try {
          await deleteCompetitionGuidebookAction(currentUrl);
        } catch (err) {
          console.warn("Gagal menghapus berkas fisik:", err);
        }
      });
    }
  };

  // Ekstrak nama berkas yang informatif dari URL
  const displayFileName = value
    ? value.split("/").pop() || "Buku-Panduan-Kompetisi.pdf"
    : "";

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span>Buku Panduan / Rulebook (PDF)</span>
          <span className="text-[11px] font-normal text-muted-foreground">
            (Opsional, Maks. 2MB)
          </span>
        </Label>
        {value && (
          <Badge
            variant="outline"
            className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            PDF Terpasang
          </Badge>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive animate-in fade-in-50">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled || isPending}
      />

      {value ? (
        // State 1: Tampilan Berkas PDF Terunggah
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate max-w-[260px] sm:max-w-[340px]">
                {displayFileName}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-muted-foreground">
                  Dokumen PDF
                </span>
                <span className="text-[11px] text-muted-foreground">•</span>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  <span>Buka / Pratinjau</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isPending}
              className="h-8 text-xs cursor-pointer"
            >
              <RefreshCw className="mr-1.5 h-3 w-3" />
              Ganti Berkas
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || isPending}
              className="h-8 text-xs px-2.5 cursor-pointer"
              title="Hapus berkas panduan"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        // State 2: Dropzone / Area Pemilih File Baru
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled && !isPending) setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && !isPending) fileInputRef.current?.click();
          }}
          className={`group relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 text-center ${
            isDragOver
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-border/80 bg-muted/10 hover:border-primary/50 hover:bg-muted/20"
          } ${disabled || isPending ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {isPending ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="h-7 w-7 text-primary animate-spin" />
              <p className="text-xs font-medium text-foreground">
                Mengunggah berkas PDF...
              </p>
              <p className="text-[11px] text-muted-foreground">
                Menyimpan ke folder publik lokal
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <UploadCloud className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-foreground mt-1">
                <span className="text-primary hover:underline">
                  Klik untuk memilih file PDF
                </span>{" "}
                atau tarik berkas ke sini
              </p>
              <p className="text-[11px] text-muted-foreground">
                Format dokumen: <strong>PDF (.pdf)</strong> saja • Maksimal ukuran: <strong>2 MB</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
