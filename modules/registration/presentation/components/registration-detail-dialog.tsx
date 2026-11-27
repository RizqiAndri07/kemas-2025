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
  Mail,
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
        if (res.data?.emailSent) {
          toast.success(
            res.message ||
              `Status pendaftar berhasil diperbarui & email terkirim ke ${res.data.emailRecipient || participantEmail}`
          );
        } else if (res.data?.emailError) {
          toast.warning(
            res.message || `Status diperbarui, namun email gagal dikirim: ${res.data.emailError}`
          );
        } else {
          toast.success(res.message || "Status pendaftar berhasil diperbarui.");
        }

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

  // Build field label and type map from formSections
  const fieldMap: Record<string, { label: string; type?: string }> = {};
  if (Array.isArray(registration.formSections)) {
    for (const section of registration.formSections) {
      if (Array.isArray(section.fields)) {
        for (const field of section.fields) {
          if (field.id) fieldMap[field.id] = { label: field.label, type: field.type };
          if (field.name) fieldMap[field.name] = { label: field.label, type: field.type };
        }
      }
    }
  }

  const renderedKeys = Object.keys(registration.data || {});
  const unmatchedFiles = (registration.files || []).filter(
    (f) =>
      !renderedKeys.includes(f.fieldName) &&
      !Object.values(registration.data || {}).includes(f.fileName)
  );

  const participantEmail = registration.email || registration.data?.email || "-";
  const participantPhone =
    registration.data?.phone ||
    registration.data?.phoneNumber ||
    registration.data?.whatsapp ||
    registration.data?.noHp ||
    "-";

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
              <span className="text-muted-foreground block text-[11px]">Email Pendaftar:</span>
              <span className="font-semibold text-foreground truncate block">{participantEmail}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Nomor WhatsApp / HP:</span>
              <span className="font-semibold text-foreground truncate block">{participantPhone}</span>
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

          {/* Rincian Jawaban Formulir Dinamis & Berkas */}
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

                  // Label yang diformat dari mapping fieldMap atau clean key
                  let formattedLabel = fieldMap[key]?.label;
                  if (!formattedLabel) {
                    formattedLabel = key
                      .replace(/^field_[\d_]+[a-z0-9]+/i, "Field")
                      .replace(/([A-Z])/g, " $1")
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase());
                  }

                  // Check whether this value corresponds to an uploaded file
                  const matchedFile = (registration.files || []).find(
                    (f) =>
                      f.fieldName === key ||
                      f.fileName === value ||
                      (typeof value === "string" && (value.includes(f.fileName) || f.fileName.includes(value)))
                  );

                  return (
                    <div
                      key={key}
                      className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs hover:bg-muted/20"
                    >
                      <span className="font-medium text-muted-foreground sm:w-1/3 capitalize">
                        {formattedLabel}
                      </span>
                      <div className="sm:w-2/3 break-words font-medium text-foreground">
                        {matchedFile ? (
                          <a
                            href={matchedFile.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center"
                          >
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 gap-1.5 text-xs font-medium cursor-pointer border-border hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              {matchedFile.fileType?.startsWith("image/") ||
                              matchedFile.fileName?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <FileText className="h-3.5 w-3.5 text-primary" />
                              )}
                              <span className="truncate max-w-[200px]">
                                {matchedFile.fileName || displayValue}
                              </span>
                              <ExternalLink className="h-3 w-3 text-muted-foreground ml-1" />
                            </Button>
                          </a>
                        ) : (
                          <span>{displayValue}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Render any additional uploaded files not explicitly in data keys */}
              {unmatchedFiles.map((file, idx) => {
                const fileLabel = fieldMap[file.fieldName]?.label || file.fieldName;
                const isImg =
                  file.fileType.startsWith("image/") ||
                  file.fileName.match(/\.(jpg|jpeg|png|webp)$/i);

                return (
                  <div
                    key={`unmatched_${idx}`}
                    className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs hover:bg-muted/20"
                  >
                    <span className="font-medium text-muted-foreground sm:w-1/3 capitalize">
                      {fileLabel}
                    </span>
                    <div className="sm:w-2/3 break-words font-medium text-foreground">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1.5 text-xs font-medium cursor-pointer border-border hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {isImg ? (
                            <ImageIcon className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-primary" />
                          )}
                          <span className="truncate max-w-[200px]">
                            {file.fileName}
                          </span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground ml-1" />
                        </Button>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
              <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                Menyimpan status <strong>VERIFIED</strong> atau <strong>REJECTED</strong> akan otomatis mengirimkan email konfirmasi ke{" "}
                <strong className="text-foreground">{participantEmail}</strong>.
              </span>
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
