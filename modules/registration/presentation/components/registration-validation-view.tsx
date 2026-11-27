"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RegistrationItem } from "../../domain/registration.interface";
import {
  RegistrationStatus,
  RegistrationStatusLabels,
} from "../../domain/registration-status.enum";
import { updateRegistrationStatusAction } from "../../application/registration.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  FileCheck2,
  Calendar,
  Trophy,
  Mail,
  User,
  Globe,
  Download,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Image as ImageIcon,
  Paperclip,
  UserCheck,
  AlertTriangle,
  Info,
  MailCheck,
  MailX,
} from "lucide-react";

interface RegistrationValidationViewProps {
  initialRegistration: RegistrationItem;
}

export function RegistrationValidationView({
  initialRegistration,
}: RegistrationValidationViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [registration, setRegistration] = useState<RegistrationItem>(initialRegistration);
  const [notes, setNotes] = useState<string>(registration.notes || "");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Status hasil pengiriman email notifikasi
  const [emailDeliveryInfo, setEmailDeliveryInfo] = useState<{
    sent: boolean;
    recipient?: string | null;
    error?: string | null;
  } | null>(null);

  // Reject confirmation dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Teks berhasil disalin.");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpdateStatus = async (newStatus: RegistrationStatus) => {
    startTransition(async () => {
      try {
        const res = await updateRegistrationStatusAction({
          id: registration.id,
          status: newStatus,
          notes: notes.trim() || null,
        });

        if (res.success) {
          if (res.data?.emailSent !== undefined) {
            setEmailDeliveryInfo({
              sent: res.data.emailSent,
              recipient: res.data.emailRecipient,
              error: res.data.emailError,
            });
          }

          if (res.data?.emailSent) {
            toast.success(
              res.message ||
                `Status pendaftaran berhasil diubah menjadi ${RegistrationStatusLabels[newStatus]} dan email notifikasi terkirim ke ${res.data.emailRecipient || participantEmail}.`
            );
          } else if (res.data?.emailError) {
            toast.warning(
              res.message ||
                `Status pendaftaran diperbarui, namun email notifikasi gagal dikirim: ${res.data.emailError}`
            );
          } else {
            toast.success(
              res.message ||
                `Status pendaftaran berhasil diubah menjadi ${RegistrationStatusLabels[newStatus]}.`
            );
          }

          setRegistration((prev) => ({
            ...prev,
            status: newStatus,
            notes: notes.trim() || null,
            verifiedAt: new Date(),
          }));
          router.refresh();
        } else {
          toast.error(res.error || "Gagal memperbarui status pendaftaran.");
        }
      } catch (err: any) {
        toast.error(err.message || "Terjadi kesalahan pada sistem.");
      }
    });
  };

  const renderStatusBadge = (st: RegistrationStatus) => {
    switch (st) {
      case "VERIFIED":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5 px-3 py-1 text-xs font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Terverifikasi (Dikonfirmasi)</span>
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 gap-1.5 px-3 py-1 text-xs font-semibold">
            <XCircle className="h-3.5 w-3.5" />
            <span>Pendaftaran Ditolak</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1.5 px-3 py-1 text-xs font-semibold">
            <Clock className="h-3.5 w-3.5" />
            <span>Menunggu Verifikasi</span>
          </Badge>
        );
    }
  };

  const formattedDate = new Date(registration.createdAt).toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  const formattedVerifiedDate = registration.verifiedAt
    ? new Date(registration.verifiedAt).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  // Ekstrak nama utama, email, dan telepon
  const participantEmail =
    registration.email ||
    registration.data?.email ||
    registration.data?.user_email ||
    "-";

  const participantPhone =
    registration.data?.phone ||
    registration.data?.phoneNumber ||
    registration.data?.whatsapp ||
    registration.data?.noHp ||
    registration.data?.nomorHp ||
    "-";

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

  // Identify any files not explicitly keyed in data
  const renderedKeys = Object.keys(registration.data || {});
  const unmatchedFiles = (registration.files || []).filter(
    (f) =>
      !renderedKeys.includes(f.fieldName) &&
      !Object.values(registration.data || {}).includes(f.fileName)
  );

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/registrations">
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Data Pendaftar</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-primary" />
              <span>Validasi Berkas Pendaftar</span>
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {registration.registrationNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {renderStatusBadge(registration.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Applicant Info & Answers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Ringkasan Identitas Pendaftar */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/50 bg-muted/15">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>Profil & Informasi Utama Peserta</span>
                </CardTitle>
                <span className="text-[11px] text-muted-foreground font-mono">
                  ID: {registration.id.slice(0, 8)}...
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Nomor Registrasi */}
                <div className="p-3 rounded-lg bg-muted/20 border border-border/50 space-y-1">
                  <span className="text-[11px] text-muted-foreground">Nomor Registrasi:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-foreground">
                      {registration.registrationNumber}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 cursor-pointer"
                      onClick={() => handleCopy(registration.registrationNumber, "regNo")}
                    >
                      {copiedKey === "regNo" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Email Pendaftar */}
                <div className="p-3 rounded-lg bg-muted/20 border border-border/50 space-y-1">
                  <span className="text-[11px] text-muted-foreground">Email Terdaftar (Unik):</span>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground truncate max-w-[200px]">
                      {participantEmail}
                    </span>
                    {participantEmail !== "-" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 cursor-pointer"
                        onClick={() => handleCopy(participantEmail, "email")}
                      >
                        {copiedKey === "email" ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Nomor WhatsApp / HP */}
                <div className="p-3 rounded-lg bg-muted/20 border border-border/50 space-y-1">
                  <span className="text-[11px] text-muted-foreground">Nomor WhatsApp / HP:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground truncate max-w-[200px]">
                      {participantPhone}
                    </span>
                    {participantPhone !== "-" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 cursor-pointer"
                        onClick={() => handleCopy(participantPhone, "phone")}
                      >
                        {copiedKey === "phone" ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Cabang Lomba */}
                <div className="p-3 rounded-lg bg-muted/20 border border-border/50 space-y-1">
                  <span className="text-[11px] text-muted-foreground">Cabang Kompetisi:</span>
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Trophy className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{registration.competitionName}</span>
                  </div>
                </div>

                {/* Formulir Pendaftaran */}
                <div className="p-3 rounded-lg bg-muted/20 border border-border/50 space-y-1">
                  <span className="text-[11px] text-muted-foreground">Struktur Formulir:</span>
                  <p className="font-medium text-foreground">{registration.formTitle}</p>
                </div>

                {/* Waktu Submit */}
                <div className="p-3 rounded-lg bg-muted/20 border border-border/50 space-y-1 sm:col-span-2">
                  <span className="text-[11px] text-muted-foreground">Waktu Pengiriman:</span>
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>

              {/* Audit Trail Verifikasi */}
              {registration.verifiedAt && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      Diverifikasi oleh:{" "}
                      <strong>{registration.verifiedByUsername || "Admin Sistem"}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {formattedVerifiedDate}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Isian Data Formulir Pendaftaran & Berkas Terlampir */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/50 bg-muted/15">
              <CardTitle className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>Isian Formulir Pendaftaran Peserta</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Rincian data isian dan berkas pendaftar. Klik berkas untuk membukanya di tab baru.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              {registration.data && Object.keys(registration.data).length > 0 ? (
                <div className="rounded-lg border border-border/60 divide-y divide-border/60 overflow-hidden text-xs">
                  {Object.entries(registration.data).map(([key, val]) => {
                    let displayValue: string;
                    if (val === null || val === undefined || val === "") {
                      displayValue = "-";
                    } else if (Array.isArray(val)) {
                      displayValue = val.join(", ");
                    } else if (typeof val === "boolean") {
                      displayValue = val ? "Ya (Disetujui)" : "Tidak";
                    } else if (typeof val === "object") {
                      displayValue = JSON.stringify(val);
                    } else {
                      displayValue = String(val);
                    }

                    // Mapping human-readable label
                    let formattedLabel = fieldMap[key]?.label;
                    if (!formattedLabel) {
                      formattedLabel = key
                        .replace(/^field_[\d_]+[a-z0-9]+/i, "Field")
                        .replace(/([A-Z])/g, " $1")
                        .replace(/_/g, " ")
                        .replace(/^\w/, (c) => c.toUpperCase());
                    }

                    // Check if this field corresponds to an uploaded file
                    const matchedFile = (registration.files || []).find(
                      (f) =>
                        f.fieldName === key ||
                        f.fileName === val ||
                        (typeof val === "string" && (val.includes(f.fileName) || f.fileName.includes(val)))
                    );

                    return (
                      <div
                        key={key}
                        className="grid grid-cols-1 sm:grid-cols-3 p-3 gap-2 hover:bg-muted/15 transition-colors items-center"
                      >
                        <span className="font-semibold text-muted-foreground capitalize">
                          {formattedLabel}
                        </span>
                        <div className="sm:col-span-2 text-foreground break-words font-medium">
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
                                className="h-8 gap-2 text-xs font-medium cursor-pointer border-border hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                {matchedFile.fileType?.startsWith("image/") ||
                                matchedFile.fileName?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                                  <ImageIcon className="h-3.5 w-3.5 text-primary" />
                                ) : (
                                  <FileText className="h-3.5 w-3.5 text-primary" />
                                )}
                                <span className="truncate max-w-[240px]">
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
                  })}

                  {/* Render any additional uploaded files not keyed in data */}
                  {unmatchedFiles.map((file, idx) => {
                    const fileLabel = fieldMap[file.fieldName]?.label || file.fieldName;
                    const isImg =
                      file.fileType.startsWith("image/") ||
                      file.fileName.match(/\.(jpg|jpeg|png|webp)$/i);

                    return (
                      <div
                        key={`unmatched_${idx}`}
                        className="grid grid-cols-1 sm:grid-cols-3 p-3 gap-2 hover:bg-muted/15 transition-colors items-center"
                      >
                        <span className="font-semibold text-muted-foreground capitalize">
                          {fileLabel}
                        </span>
                        <div className="sm:col-span-2 text-foreground break-words font-medium">
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
                              className="h-8 gap-2 text-xs font-medium cursor-pointer border-border hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              {isImg ? (
                                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <FileText className="h-3.5 w-3.5 text-primary" />
                              )}
                              <span className="truncate max-w-[240px]">
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
              ) : (
                <p className="text-xs text-muted-foreground italic py-3 text-center">
                  Tidak ada data isian formulir.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Validation Action Box & Security Info */}
        <div className="space-y-6">
          {/* Action Box: Panel Validasi & Keputusan Admin */}
          <Card className="border-primary/30 shadow-md p-0">
            <CardHeader className="p-5 pb-3 border-b border-border/50 bg-primary/5">
              <CardTitle className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Panel Tindakan Validasi</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Tentukan keputusan verifikasi dan berikan catatan evaluasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Status saat ini */}
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">
                  Status Saat Ini:
                </span>
                <div>{renderStatusBadge(registration.status)}</div>
              </div>

              {/* Target Notifikasi Email Pendaftar */}
              <div className="p-3 rounded-lg bg-muted/20 border border-border/50 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1 font-medium">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    <span>Target Email Pendaftar:</span>
                  </span>
                  {participantEmail !== "-" && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                      Tersedia
                    </Badge>
                  )}
                </div>
                <div className="font-semibold text-xs text-foreground truncate">
                  {participantEmail !== "-" ? participantEmail : "Email tidak terdaftar"}
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  1x klik tombol validasi di bawah akan otomatis memperbarui database dan mengirim email konfirmasi resmi.
                </p>
              </div>

              {/* Indikator Status Hasil Pengiriman Email */}
              {emailDeliveryInfo && (
                <div
                  className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${
                    emailDeliveryInfo.sent
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold">
                    {emailDeliveryInfo.sent ? (
                      <>
                        <MailCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Email Notifikasi Berhasil Terkirim</span>
                      </>
                    ) : (
                      <>
                        <MailX className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Email Notifikasi Gagal Terkirim</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90 pl-5.5">
                    {emailDeliveryInfo.sent
                      ? `Pesan telah diterima server email untuk ${emailDeliveryInfo.recipient || participantEmail}.`
                      : `Alasan: ${emailDeliveryInfo.error || "Alamat email tidak valid atau kendala SMTP."}`}
                  </p>
                </div>
              )}

              {/* Textarea Catatan Admin */}
              <div className="space-y-1.5">
                <Label htmlFor="admin_notes" className="text-xs font-medium">
                  Catatan Verifikasi / Alasan Penolakan:
                </Label>
                <Textarea
                  id="admin_notes"
                  placeholder="Masukkan catatan evaluasi atau alasan (wajib jika ditolak)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="text-xs resize-none"
                  disabled={isPending}
                />
                <p className="text-[10px] text-muted-foreground">
                  Catatan ini akan dicantumkan pada email pendaftar dan riwayat audit sistem.
                </p>
              </div>

              {/* Tombol Keputusan: Confirm (Verifikasi) & Reject (Tolak) */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                {/* Button Confirm */}
                <Button
                  onClick={() => setConfirmDialogOpen(true)}
                  disabled={isPending || registration.status === "VERIFIED"}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 gap-2 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {registration.status === "VERIFIED"
                      ? "Telah Terverifikasi (Dikonfirmasi)"
                      : "Confirm (Verifikasi Pendaftaran)"}
                  </span>
                </Button>

                {/* Button Reject */}
                <Button
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={isPending || registration.status === "REJECTED"}
                  variant="destructive"
                  className="w-full font-semibold text-xs h-10 gap-2 cursor-pointer shadow-xs"
                >
                  <XCircle className="h-4 w-4" />
                  <span>
                    {registration.status === "REJECTED"
                      ? "Telah Ditolak"
                      : "Reject (Tolak Pendaftaran)"}
                  </span>
                </Button>

                {/* Reset to UNVERIFIED if already verified or rejected */}
                {registration.status !== "UNVERIFIED" && (
                  <Button
                    onClick={() => handleUpdateStatus("UNVERIFIED")}
                    disabled={isPending}
                    variant="outline"
                    className="w-full text-xs h-9 gap-2 text-amber-600 hover:text-amber-700 border-amber-500/30"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>Kembalikan ke Menunggu Verifikasi</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Dialog Konfirmasi Setuju (Confirm) */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-heading font-bold flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>Konfirmasi & Verifikasi Pendaftaran</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed">
              Apakah Anda yakin ingin memverifikasi pendaftaran{" "}
              <strong>{registration.registrationNumber}</strong> untuk peserta kompetisi{" "}
              <strong>{registration.competitionName}</strong>? Status akan diubah menjadi{" "}
              <strong>VERIFIED</strong> dan sistem secara otomatis akan mengirimkan email konfirmasi ke{" "}
              <strong>{participantEmail}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="text-xs">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() => {
                setConfirmDialogOpen(false);
                handleUpdateStatus("VERIFIED");
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              {isPending ? "Memproses..." : "Ya, Konfirmasi & Verifikasi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Konfirmasi Tolak (Reject) */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-heading font-bold flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Tolak Pendaftaran Peserta</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed">
              Apakah Anda yakin ingin menolak pendaftaran{" "}
              <strong>{registration.registrationNumber}</strong>? Status akan diubah menjadi{" "}
              <strong>REJECTED</strong> dan sistem secara otomatis akan mengirimkan email pemberitahuan penolakan beserta catatan evaluasi ke{" "}
              <strong>{participantEmail}</strong>. Pastikan Anda telah mengisi alasan penolakan pada kolom catatan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="text-xs">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() => {
                setRejectDialogOpen(false);
                handleUpdateStatus("REJECTED");
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              {isPending ? "Memproses..." : "Ya, Tolak Pendaftaran"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
