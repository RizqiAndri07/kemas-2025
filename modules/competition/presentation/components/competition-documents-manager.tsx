"use client";

import { useState, useRef, useTransition } from "react";
import {
  FileText,
  UploadCloud,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import {
  uploadCompetitionGuidebookAction,
  deleteCompetitionGuidebookAction,
} from "../../application/competition-upload.action";

export interface CompetitionDocumentItem {
  id?: string;
  name: string;
  filePath: string;
}

interface CompetitionDocumentsManagerProps {
  documents: CompetitionDocumentItem[];
  onChangeDocuments: (docs: CompetitionDocumentItem[]) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export function CompetitionDocumentsManager({
  documents,
  onChangeDocuments,
  disabled = false,
}: CompetitionDocumentsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [errorMessages, setErrorMessages] = useState<Record<number, string>>({});
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleAddDocument = () => {
    if (disabled || isPending) return;
    const newDoc: CompetitionDocumentItem = {
      name: documents.length === 0 ? "Buku Panduan / Rulebook" : "",
      filePath: "",
    };
    onChangeDocuments([...documents, newDoc]);
  };

  const handleRemoveDocument = (indexToRemove: number) => {
    if (disabled || isPending) return;
    const docToRemove = documents[indexToRemove];

    // Bersihkan pesan error pada indeks tersebut jika ada
    setErrorMessages((prev) => {
      const next = { ...prev };
      delete next[indexToRemove];
      return next;
    });

    // Jika sudah ada berkas yang diupload, hapus dari disk
    if (docToRemove?.filePath) {
      startTransition(async () => {
        try {
          await deleteCompetitionGuidebookAction(docToRemove.filePath);
        } catch {
          // Non-blocking cleanup
        }
      });
    }

    const updated = documents.filter((_, i) => i !== indexToRemove);
    onChangeDocuments(updated);
    toast.info("Dokumen dihapus dari daftar.");
  };

  const handleUpdateDocumentName = (index: number, newName: string) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], name: newName };
    onChangeDocuments(updated);
  };

  const handleFileSelected = (index: number, file: File) => {
    setErrorMessages((prev) => ({ ...prev, [index]: "" }));

    // 1. Validasi Tipe Berkas (PDF saja)
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      const msg = "Format berkas tidak valid. Harap pilih dokumen PDF (.pdf).";
      setErrorMessages((prev) => ({
        ...prev,
        [index]: msg,
      }));
      toast.error(msg);
      return;
    }

    // 2. Validasi Ukuran (Maksimal 2MB)
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      const msg = `Ukuran berkas melebihi batas 2MB (ukuran: ${sizeMb} MB). Harap pilih berkas yang lebih kecil.`;
      setErrorMessages((prev) => ({
        ...prev,
        [index]: msg,
      }));
      toast.error(msg);
      return;
    }

    // 3. Upload Berkas ke Server
    setUploadingIndex(index);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadCompetitionGuidebookAction(formData);

        if (!res.success) {
          const errText = res.error || "Gagal mengunggah berkas PDF.";
          setErrorMessages((prev) => ({
            ...prev,
            [index]: errText,
          }));
          toast.error(errText);
          return;
        }

        if (!res.data) {
          const errText = "Data berkas tidak diterima dari server.";
          setErrorMessages((prev) => ({
            ...prev,
            [index]: errText,
          }));
          toast.error(errText);
          return;
        }

        const oldPath = documents[index]?.filePath;
        if (oldPath && oldPath !== res.data.url) {
          try {
            await deleteCompetitionGuidebookAction(oldPath);
          } catch {
            // Non-blocking cleanup
          }
        }

        // Simpan path baru & isi otomatis nama dokumen jika masih kosong
        const updated = [...documents];
        const currentName = updated[index]?.name?.trim() || "";
        const cleanName = currentName
          ? currentName
          : file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

        updated[index] = {
          ...updated[index],
          name: cleanName,
          filePath: res.data.url,
        };
        onChangeDocuments(updated);
        toast.success(`Dokumen PDF "${cleanName}" berhasil diunggah.`);
      } catch (err) {
        const errText =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memproses upload berkas.";
        setErrorMessages((prev) => ({
          ...prev,
          [index]: errText,
        }));
        toast.error(errText);
      } finally {
        setUploadingIndex(null);
      }
    });
  };

  const handleClearFileOnly = (index: number) => {
    if (disabled || isPending) return;
    const doc = documents[index];
    if (doc?.filePath) {
      startTransition(async () => {
        try {
          await deleteCompetitionGuidebookAction(doc.filePath);
        } catch {
          // Non-blocking cleanup
        }
      });
    }

    const updated = [...documents];
    updated[index] = { ...updated[index], filePath: "" };
    onChangeDocuments(updated);
    toast.info("Berkas PDF dilepas dari dokumen.");
  };

  return (
    <div className="space-y-4">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dokumen & Berkas Kegiatan (PDF)
            </h4>
            {documents.length > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-semibold">
                {documents.length} Dokumen
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Tambahkan buku panduan (rulebook), juknis, surat izin, atau formulir pendaftaran (Maks. 2MB per PDF).
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddDocument}
          disabled={disabled || isPending}
          className="h-8 text-xs cursor-pointer gap-1.5 self-start sm:self-auto shrink-0 shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah Dokumen</span>
        </Button>
      </div>

      {/* List of Documents */}
      {documents.length === 0 ? (
        // Empty State jika belum ada dokumen
        <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-border/80 bg-muted/10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
            <UploadCloud className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium text-foreground">
            Belum ada dokumen yang dilampirkan
          </p>
          <p className="text-[11px] text-muted-foreground max-w-sm mt-0.5 mb-3 leading-relaxed">
            Anda dapat mengunggah beberapa berkas sekaligus seperti buku petunjuk teknis, formulir pendaftaran, atau berkas persyaratan acara.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddDocument}
            disabled={disabled || isPending}
            className="h-8 text-xs cursor-pointer gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Dokumen Pertama</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc, index) => {
            const isCurrentUploading = uploadingIndex === index;
            const error = errorMessages[index];
            const displayFileName = doc.filePath
              ? doc.filePath.split("/").pop() || "dokumen.pdf"
              : "";

            return (
              <Card
                key={index}
                className="border-border/70 shadow-xs overflow-hidden bg-card/60 transition-colors"
              >
                <CardContent className="p-3.5 space-y-3">
                  {/* Top Bar item */}
                  <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold h-5 px-1.5 bg-muted/40 text-foreground"
                      >
                        Dokumen #{index + 1}
                      </Badge>
                      {doc.filePath ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Berkas Terpasang
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          Belum Ada Berkas
                        </span>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(index)}
                      disabled={disabled || isPending}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                      title="Hapus dokumen ini"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive animate-in fade-in-50">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <p className="font-medium leading-relaxed">{error}</p>
                    </div>
                  )}

                  {/* Form inputs per item */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                    {/* Input Nama Dokumen */}
                    <div className="space-y-1.5">
                      <Label htmlFor={`doc-name-${index}`} className="text-xs font-medium">
                        Nama / Judul Dokumen <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`doc-name-${index}`}
                        placeholder="Contoh: Buku Panduan / Juknis Lomba"
                        value={doc.name}
                        onChange={(e) => handleUpdateDocumentName(index, e.target.value)}
                        disabled={disabled || isPending}
                        className="h-9 text-xs"
                        required
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Label yang tampil kepada peserta atau panitia.
                      </p>
                    </div>

                    {/* Area Unggah / Preview File */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">
                        Berkas Dokumen PDF <span className="text-destructive">*</span>
                      </Label>

                      {/* Hidden File Input */}
                      <input
                        ref={(el) => {
                          fileInputRefs.current[index] = el;
                        }}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelected(index, file);
                          if (fileInputRefs.current[index]) {
                            fileInputRefs.current[index]!.value = "";
                          }
                        }}
                        disabled={disabled || isPending}
                      />

                      {doc.filePath ? (
                        // File sudah terunggah
                        <div className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border/80 bg-muted/20">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
                              <FileCheck className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-foreground truncate max-w-[160px] sm:max-w-[200px]">
                                {displayFileName}
                              </p>
                              <a
                                href={doc.filePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                              >
                                <span>Lihat Berkas</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRefs.current[index]?.click()}
                              disabled={disabled || isPending}
                              className="h-7 text-[11px] px-2 cursor-pointer"
                              title="Ganti berkas PDF"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Ganti
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleClearFileOnly(index)}
                              disabled={disabled || isPending}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                              title="Hapus berkas ini"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Dropzone pemilih berkas
                        <div
                          onClick={() => {
                            if (!disabled && !isPending && !isCurrentUploading) {
                              fileInputRefs.current[index]?.click();
                            }
                          }}
                          className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-center ${
                            isCurrentUploading
                              ? "bg-primary/5 border-primary"
                              : "border-border/80 bg-muted/10 hover:border-primary/50 hover:bg-muted/20"
                          }`}
                        >
                          {isCurrentUploading ? (
                            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                              <span>Mengunggah PDF...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <UploadCloud className="h-3.5 w-3.5 text-primary" />
                              <span className="font-medium text-foreground">Pilih Berkas PDF</span>
                              <span className="text-[10px]">(Maks. 2MB)</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
