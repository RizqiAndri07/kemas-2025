"use client";

import { useState } from "react";
import { RegistrationItem } from "../../domain/registration.interface";
import {
  RegistrationStatus,
  RegistrationStatusLabels,
} from "../../domain/registration-status.enum";
import { updateRegistrationStatusAction } from "../../application/registration.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  FileText,
  Download,
  ExternalLink,
  ShieldAlert,
  UserCheck,
  FileCheck2,
  Paperclip,
  Image as ImageIcon,
} from "lucide-react";

interface RegistrationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: RegistrationItem | null;
  onStatusUpdated?: (updated: RegistrationItem) => void;
}

export function RegistrationDetailDialog({
  open,
  onOpenChange,
  registration,
  onStatusUpdated,
}: RegistrationDetailDialogProps) {
  if (!registration) return null;

  const [status, setStatus] = useState<RegistrationStatus>(registration.status);
  const [notes, setNotes] = useState<string>(registration.notes || "");
  const [isPending, setIsPending] = useState(false);

  // Sync state if registration changes
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setStatus(registration.status);
      setNotes(registration.notes || "");
    }
    onOpenChange(isOpen);
  };

  const handleSaveStatus = async () => {
    setIsPending(true);
    try {
      const res = await updateRegistrationStatusAction({
        id: registration.id,
        status,
        notes: notes.trim() || null,
      });

      if (res.success) {
        toast.success(res.message || "Status pendaftar berhasil diperbarui.");
        if (onStatusUpdated) {
          onStatusUpdated({
            ...registration,
            status,
            notes: notes.trim() || null,
            verifiedAt: new Date(),
          });
        }
        onOpenChange(false);
      } else {
        toast.error(res.error || "Gagal memperbarui status pendaftar.");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem saat memperbarui status.");
    } finally {
      setIsPending(false);
    }
  };

  const renderStatusBadge = (st: RegistrationStatus) => {
    switch (st) {
      case "VERIFIED":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Terverifikasi</span>
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 gap-1">
            <XCircle className="h-3 w-3" />
            <span>Ditolak</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1">
            <Clock className="h-3 w-3" />
            <span>Menunggu Verifikasi</span>
          </Badge>
        );
    }
  };

  const formattedDate = new Date(registration.createdAt).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[88vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center justify-between gap-3 pr-6">
            <div>
              <DialogTitle className="text-base font-heading font-bold flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-primary" />
                <span>Detail Pendaftar</span>
              </DialogTitle>
              <DialogDescription className="text-xs font-mono text-muted-foreground mt-0.5">
                {registration.registrationNumber}
              </DialogDescription>
            </div>
            {renderStatusBadge(registration.status)}
          </div>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Metadata Ringkasan */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/30 border border-border/60 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Kompetisi / Acara:</span>
              <span className="font-semibold text-foreground">{registration.competitionName}</span>
              <span className="text-[10px] text-muted-foreground block">
                Tipe: {registration.competitionType}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Formulir Pendaftaran:</span>
              <span className="font-medium text-foreground">{registration.formTitle}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Waktu Pendaftaran:</span>
              <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {formattedDate}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Audit IP / Device:</span>
              <span className="font-mono text-[11px] text-muted-foreground truncate block">
                {registration.ipAddress || "Unknown IP"}
              </span>
            </div>
          </div>

          {/* Rincian Jawaban Formulir Dinamis */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Isian Formulir Peserta
            </h4>

            <div className="rounded-xl border border-border/70 overflow-hidden divide-y divide-border/60 bg-card">
              {Object.entries(registration.data).length === 0 ? (
                <div className="p-4 text-xs text-muted-foreground text-center">
                  Tidak ada data isian teks.
                </div>
              ) : (
                Object.entries(registration.data).map(([key, value]) => {
                  let displayValue: string;
                  if (typeof value === "boolean") {
                    displayValue = value ? "Ya / Setuju" : "Tidak";
                  } else if (Array.isArray(value)) {
                    displayValue = value.join(", ");
                  } else if (value === null || value === undefined || value === "") {
                    displayValue = "-";
                  } else {
                    displayValue = String(value);
                  }

                  // Label yang diformat dari key (e.g. nama_lengkap -> Nama Lengkap)
                  const formattedLabel = key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());

                  return (
                    <div
                      key={key}
                      className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs hover:bg-muted/20"
                    >
                      <span className="font-medium text-muted-foreground sm:w-1/3">
                        {formattedLabel}
                      </span>
                      <span className="font-semibold text-foreground sm:w-2/3 break-words">
                        {displayValue}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Berkas & Dokumen yang Diunggah */}
          {registration.files && registration.files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5 text-primary" />
                Berkas & Dokumen Persyaratan ({registration.files.length})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {registration.files.map((file, idx) => {
                  const isImage =
                    file.fileType.startsWith("image/") ||
                    file.fileName.match(/\.(jpg|jpeg|png|webp)$/i);

                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-border/70 p-3 bg-muted/10 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          {isImage ? (
                            <ImageIcon className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium truncate text-foreground">
                            {file.fileName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {file.fieldName}
                          </p>
                        </div>
                      </div>

                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Buka Berkas"
                        className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Verifikasi Status Pendaftar */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5" />
              Kelola Verifikasi Pendaftar
            </h4>

            <div className="space-y-1.5">
              <Label htmlFor="verificationStatus" className="text-xs font-medium">
                Pilih Status Verifikasi <span className="text-destructive">*</span>
              </Label>
              <Select
                value={status}
                onValueChange={(val) => {
                  if (val) setStatus(val as RegistrationStatus);
                }}
                disabled={isPending}
              >
                <SelectTrigger id="verificationStatus" className="h-9 text-xs w-full bg-card">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNVERIFIED">
                    Belum Terverifikasi (Menunggu Verifikasi)
                  </SelectItem>
                  <SelectItem value="VERIFIED">
                    Terverifikasi (Diterima / Lolos Syarat)
                  </SelectItem>
                  <SelectItem value="REJECTED">
                    Ditolak (Berkas Tidak Sesuai / Pembayaran Batal)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="verificationNotes" className="text-xs font-medium">
                Catatan Verifikasi / Alasan Penolakan (Opsional)
              </Label>
              <Textarea
                id="verificationNotes"
                placeholder="Contoh: Bukti transfer terkonfirmasi valid, data kartu pelajar lengkap."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isPending}
                rows={2}
                className="text-xs bg-card resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 pt-3 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="text-xs cursor-pointer"
          >
            Tutup
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSaveStatus}
            disabled={isPending}
            className="text-xs font-semibold cursor-pointer"
          >
            {isPending ? "Menyimpan..." : "Simpan Status Verifikasi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
