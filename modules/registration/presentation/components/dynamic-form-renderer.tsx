"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FormSectionConfig,
  FormFieldConfig,
} from "@/modules/competition/domain/competition-form.interface";
import { CompetitionSelect } from "@/modules/competition/infrastructure/competition.table";
import { CompetitionFormSelect } from "@/modules/competition/infrastructure/competition-form.table";
import { submitRegistrationAction } from "@/modules/registration/application/registration.actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Mail,
  Phone,
  Copy,
  Check,
  ArrowLeft,
  ShieldAlert,
  Info,
} from "lucide-react";

interface DynamicFormRendererProps {
  competition: CompetitionSelect;
  form: CompetitionFormSelect;
  onSubmitAction?: (
    answers: Record<string, any>
  ) => Promise<{ success: boolean; error?: string; message?: string; data?: any }>;
}

export function DynamicFormRenderer({
  competition,
  form,
  onSubmitAction,
}: DynamicFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fileData, setFileData] = useState<Record<string, File>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedRegNumber, setSubmittedRegNumber] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSpamBlocked, setIsSpamBlocked] = useState(false);
  const [isEmailDuplicate, setIsEmailDuplicate] = useState(false);
  const [copiedRegNo, setCopiedRegNo] = useState(false);

  const sections: FormSectionConfig[] = form.sections || [];

  // Periksa apakah sudah ada field email atau phone di dalam form sections bawaan
  const hasExistingEmailField = sections.some((s) =>
    s.fields.some((f) => f.id === "email")
  );
  const hasExistingPhoneField = sections.some((s) =>
    s.fields.some((f) => ["phone", "phoneNumber", "noHp", "no_hp", "telepon"].includes(f.id))
  );

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleCheckboxGroupChange = (
    fieldId: string,
    optionValue: string,
    checked: boolean
  ) => {
    const currentList: string[] = Array.isArray(formData[fieldId])
      ? formData[fieldId]
      : [];

    let updated: string[];
    if (checked) {
      updated = [...currentList, optionValue];
    } else {
      updated = currentList.filter((v) => v !== optionValue);
    }

    setFormData((prev) => ({ ...prev, [fieldId]: updated }));

    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleFileChange = (field: FormFieldConfig, file: File | null) => {
    if (!file) return;

    const fileConfig = field.validation?.fileConfig;
    const maxSize = (fileConfig?.maxSizeMb || 2) * 1024 * 1024;

    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        [field.id]: `Ukuran berkas melebihi batas maksimal ${fileConfig?.maxSizeMb || 2} MB.`,
      }));
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    const allowed = fileConfig?.allowedTypes || ["image", "pdf"];

    const isAllowed =
      (isImage && allowed.includes("image")) || (isPdf && allowed.includes("pdf"));

    if (!isAllowed) {
      setErrors((prev) => ({
        ...prev,
        [field.id]: `Format berkas "${file.name}" tidak diizinkan. Harap unggah format ${allowed.join(" / ")}.`,
      }));
      return;
    }

    setFileData((prev) => ({ ...prev, [field.id]: file }));
    setFormData((prev) => ({ ...prev, [field.id]: file.name }));

    if (errors[field.id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field.id];
        return next;
      });
    }
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Validasi default field Email (Wajib diisi & format email valid)
    const emailVal = formData.email ? String(formData.email).trim() : "";
    if (!emailVal) {
      newErrors.email = "Alamat email aktif wajib diisi.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        newErrors.email = "Format alamat email tidak valid (contoh: peserta@gmail.com).";
      }
    }

    // 2. Validasi default field Nomor HP (Wajib diisi & format valid)
    const phoneVal = formData.phone ? String(formData.phone).trim() : "";
    if (!phoneVal) {
      newErrors.phone = "Nomor WhatsApp / HP aktif wajib diisi.";
    } else {
      const cleanPhone = phoneVal.replace(/[^0-9+]/g, "");
      if (cleanPhone.length < 9 || cleanPhone.length > 16) {
        newErrors.phone = "Format nomor HP tidak valid (minimal 9 digit, contoh: 081234567890).";
      }
    }

    // 3. Validasi field dinamis dari sections
    for (const section of sections) {
      for (const field of section.fields) {
        const val = formData[field.id];

        // Required check
        if (field.required) {
          if (field.type === "checkbox") {
            const hasOptions =
              field.validation?.options && field.validation.options.length > 0;
            if (hasOptions) {
              if (!Array.isArray(val) || val.length === 0) {
                newErrors[field.id] = `Pilih minimal 1 opsi untuk ${field.label}.`;
                continue;
              }
            } else {
              if (val !== true) {
                newErrors[field.id] = `${field.label} wajib dicentang/disetujui.`;
                continue;
              }
            }
          } else if (field.type === "file") {
            if (!val && !fileData[field.id]) {
              newErrors[field.id] = `Berkas untuk ${field.label} wajib diunggah.`;
              continue;
            }
          } else {
            if (val === undefined || val === null || String(val).trim() === "") {
              newErrors[field.id] = `${field.label} wajib diisi.`;
              continue;
            }
          }
        }

        // Type specific validation
        if (val !== undefined && val !== null && val !== "") {
          if (field.type === "url") {
            try {
              new URL(val);
            } catch {
              newErrors[field.id] = "Format URL tidak valid (harus diawali http:// atau https://).";
            }
          }

          if (field.type === "number") {
            const num = Number(val);
            if (isNaN(num)) {
              newErrors[field.id] = "Input harus berupa angka valid.";
            } else {
              if (field.validation?.min !== undefined && num < field.validation.min) {
                newErrors[field.id] = `Nilai minimal adalah ${field.validation.min}.`;
              }
              if (field.validation?.max !== undefined && num > field.validation.max) {
                newErrors[field.id] = `Nilai maksimal adalah ${field.validation.max}.`;
              }
            }
          }

          if (field.type === "text" || field.type === "textarea") {
            const strLen = String(val).length;
            if (field.validation?.min !== undefined && strLen < field.validation.min) {
              newErrors[field.id] = `Minimal ${field.validation.min} karakter.`;
            }
            if (field.validation?.max !== undefined && strLen > field.validation.max) {
              newErrors[field.id] = `Maksimal ${field.validation.max} karakter.`;
            }
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCopyRegNumber = () => {
    if (!submittedRegNumber) return;
    navigator.clipboard.writeText(submittedRegNumber);
    setCopiedRegNo(true);
    toast.success("Nomor registrasi berhasil disalin.");
    setTimeout(() => setCopiedRegNo(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSpamBlocked(false);
    setIsEmailDuplicate(false);

    if (!validateAll()) {
      const msg = "Mohon lengkapi dan periksa kembali field input yang bertanda merah.";
      setSubmitError(msg);
      toast.error(msg);
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmitAction) {
        const res = await onSubmitAction(formData);
        if (!res.success) {
          const msg = res.error || "Gagal mengirimkan formulir pendaftaran.";
          setSubmitError(msg);
          if (msg.includes("diblokir") || msg.includes("spam")) {
            setIsSpamBlocked(true);
          }
          if (msg.includes("sudah pernah terdaftar") || msg.includes("Email")) {
            setIsEmailDuplicate(true);
          }
          toast.error(msg);
          setIsSubmitting(false);
          return;
        }
        setSubmittedRegNumber(res.data?.registrationNumber || "KP25-SUCCESS");
        setIsSuccess(true);
        toast.success(res.message || "Pendaftaran berhasil dikirim!");
        return;
      }

      // Default Submit menggunakan FormData ke submitRegistrationAction
      const bodyFormData = new FormData();
      bodyFormData.append("competitionId", competition.id);
      bodyFormData.append("formId", form.id);
      bodyFormData.append(
        "data",
        JSON.stringify({
          ...formData,
          email: formData.email?.trim().toLowerCase(),
        })
      );

      // Lampirkan semua berkas yang diunggah
      for (const [key, file] of Object.entries(fileData)) {
        bodyFormData.append(key, file);
      }

      const res = await submitRegistrationAction(bodyFormData);

      if (!res.success) {
        const errMsg = res.error || "Gagal mengirim formulir pendaftaran.";
        setSubmitError(errMsg);

        if (errMsg.includes("diblokir") || errMsg.includes("spam") || errMsg.includes("3 jam")) {
          setIsSpamBlocked(true);
        }
        if (errMsg.includes("sudah pernah terdaftar") || errMsg.includes("email yang sama")) {
          setIsEmailDuplicate(true);
        }

        toast.error(errMsg);
        return;
      }

      setSubmittedRegNumber(res.data?.registrationNumber || "");
      setIsSuccess(true);
      toast.success(res.message || "Pendaftaran Anda berhasil dikirim!");
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan pada sistem.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Layar Sukses Pengiriman Formulir
  if (isSuccess) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/[0.03] shadow-lg max-w-2xl mx-auto p-6 md:p-8 text-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto shadow-inner">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Pendaftaran Berhasil Dikirim
          </span>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            Terima Kasih Telah Mendaftar!
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Data pendaftaran Anda untuk cabang kompetisi{" "}
            <strong className="text-foreground">{competition.name}</strong> telah berhasil disimpan ke sistem panitia Kemas Prasasti 2025.
          </p>
        </div>

        {/* Kotak Nomor Registrasi */}
        {submittedRegNumber && (
          <div className="p-4 rounded-xl bg-background border border-emerald-500/30 shadow-xs max-w-md mx-auto space-y-2">
            <span className="text-[11px] text-muted-foreground font-medium">
              Nomor Registrasi Anda:
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-base font-bold text-foreground tracking-wide">
                {submittedRegNumber}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 cursor-pointer"
                onClick={handleCopyRegNumber}
              >
                {copiedRegNo ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Simpan nomor registrasi di atas sebagai bukti pendaftaran resmi.
            </p>
          </div>
        )}

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left max-w-md mx-auto space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-1.5 font-semibold">
            <Info className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Tahap Selanjutnya:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
            Panitia akan memverifikasi berkas dan bukti pembayaran Anda. Pastikan email{" "}
            <strong>{formData.email}</strong> aktif untuk menerima informasi lanjutan atau silakan hubungi Contact Person panitia.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href={`/competition/${competition.id}`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full text-xs gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Informasi Lomba
            </Button>
          </Link>
          <Link href="/competition" className="w-full sm:w-auto">
            <Button variant="default" className="w-full text-xs">
              Jelajahi Lomba Lainnya
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {/* Form Header Card */}
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-accent" />
        <CardHeader className="p-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Formulir Pendaftaran Resmi
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-medium">
                {competition.name}
              </span>
            </div>
            <CardTitle className="text-2xl font-heading font-bold text-foreground">
              {form.title}
            </CardTitle>
            {form.description && (
              <CardDescription className="text-xs leading-relaxed text-muted-foreground pt-1">
                {form.description}
              </CardDescription>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Spam IP Blocked Alert Banner */}
      {isSpamBlocked && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
            <span>Pemberitahuan Sistem: Akses IP Diblokir Sementara</span>
          </div>
          <p className="text-xs leading-relaxed">
            {submitError}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Batas pengiriman formulir adalah maksimal 3 kali per menit. Silakan tunggu hingga masa blokir berakhir atau hubungi administrator panitia melalui WhatsApp.
          </p>
        </div>
      )}

      {/* Duplicate Email Alert Banner */}
      {isEmailDuplicate && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>Email Telah Terdaftar</span>
          </div>
          <p className="text-xs leading-relaxed">
            {submitError}
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
            Satu alamat email hanya diizinkan mendaftar 1 kali pada cabang lomba ini untuk mencegah duplikasi. Jika Anda perlu mengubah data atau perbaikan berkas, silakan langsung menghubungi admin panitia.
          </p>
        </div>
      )}

      {/* General Error Banner */}
      {submitError && !isSpamBlocked && !isEmailDuplicate && (
        <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* DEFAULT FIELD WAJIB: Input Email & Nomor HP Pendaftar */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="p-5 pb-3 border-b border-border/50 bg-muted/15">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
              <Mail className="h-3 w-3" />
            </span>
            <CardTitle className="text-sm font-heading font-bold text-foreground">
              Identitas Kontak & Narahubung Pendaftar
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground pl-7">
            Wajib diisi sebagai data kontak resmi peserta. Email dan nomor WhatsApp digunakan untuk verifikasi dan konfirmasi kepesertaan.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label
              htmlFor="field_email"
              className={`text-xs font-medium flex items-center gap-1 ${
                errors.email ? "text-destructive" : "text-foreground"
              }`}
            >
              <span>Alamat Email Aktif</span>
              <span className="text-destructive font-bold">*</span>
            </Label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="field_email"
                type="email"
                placeholder="contoh: peserta@gmail.com"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`h-9 text-xs pl-9 ${
                  errors.email ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                disabled={isSubmitting}
                required
              />
            </div>
            {errors.email ? (
              <p className="text-[11px] font-medium text-destructive">
                {errors.email}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Email ini akan digunakan untuk pengiriman status verifikasi dan bukti registrasi.
              </p>
            )}
          </div>

          {/* Nomor HP / WhatsApp */}
          <div className="space-y-1.5">
            <Label
              htmlFor="field_phone"
              className={`text-xs font-medium flex items-center gap-1 ${
                errors.phone ? "text-destructive" : "text-foreground"
              }`}
            >
              <span>Nomor WhatsApp / HP Aktif</span>
              <span className="text-destructive font-bold">*</span>
            </Label>
            <div className="relative">
              <Phone className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="field_phone"
                type="tel"
                placeholder="contoh: 081234567890"
                value={formData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`h-9 text-xs pl-9 ${
                  errors.phone ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                disabled={isSubmitting}
                required
              />
            </div>
            {errors.phone ? (
              <p className="text-[11px] font-medium text-destructive">
                {errors.phone}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Pastikan nomor WhatsApp aktif untuk koordinasi teknis dan informasi penting dari panitia.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Sections from Form Builder */}
      {sections.map((section, sIdx) => {
        // Filter out redundant email & phone fields if section already defines one
        const fieldsToRender = section.fields.filter((f) => {
          if (!hasExistingEmailField && f.id === "email") return false;
          if (!hasExistingPhoneField && ["phone", "phoneNumber", "noHp", "no_hp", "telepon"].includes(f.id)) return false;
          return true;
        });

        return (
          <Card key={section.id || sIdx} className="border-border/70 shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/50 bg-muted/15">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                  {sIdx + 2}
                </span>
                <CardTitle className="text-sm font-heading font-bold text-foreground">
                  {section.title}
                </CardTitle>
              </div>
              {section.description && (
                <CardDescription className="text-xs text-muted-foreground pl-7">
                  {section.description}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {fieldsToRender.map((field) => {
                const fieldError = errors[field.id];

                return (
                  <div key={field.id} className="space-y-1.5">
                    <Label
                      htmlFor={`field_${field.id}`}
                      className={`text-xs font-medium flex items-center gap-1 ${
                        fieldError ? "text-destructive" : "text-foreground"
                      }`}
                    >
                      <span>{field.label}</span>
                      {field.required && (
                        <span className="text-destructive font-bold">*</span>
                      )}
                    </Label>

                    {/* Input Tipe: text */}
                    {field.type === "text" && (
                      <Input
                        id={`field_${field.id}`}
                        placeholder={field.placeholder || "Ketik jawaban Anda..."}
                        value={formData[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={`h-9 text-xs ${
                          fieldError ? "border-destructive focus-visible:ring-destructive" : ""
                        }`}
                        disabled={isSubmitting}
                      />
                    )}

                    {/* Input Tipe: textarea */}
                    {field.type === "textarea" && (
                      <Textarea
                        id={`field_${field.id}`}
                        placeholder={field.placeholder || "Ketik jawaban lengkap Anda..."}
                        value={formData[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        rows={3}
                        className={`text-xs resize-none ${
                          fieldError ? "border-destructive focus-visible:ring-destructive" : ""
                        }`}
                        disabled={isSubmitting}
                      />
                    )}

                    {/* Input Tipe: number */}
                    {field.type === "number" && (
                      <Input
                        id={`field_${field.id}`}
                        type="number"
                        placeholder={field.placeholder || "Masukkan angka..."}
                        min={field.validation?.min}
                        max={field.validation?.max}
                        value={formData[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={`h-9 text-xs ${
                          fieldError ? "border-destructive focus-visible:ring-destructive" : ""
                        }`}
                        disabled={isSubmitting}
                      />
                    )}

                    {/* Input Tipe: url */}
                    {field.type === "url" && (
                      <Input
                        id={`field_${field.id}`}
                        type="url"
                        placeholder={field.placeholder || "https://..."}
                        value={formData[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={`h-9 text-xs ${
                          fieldError ? "border-destructive focus-visible:ring-destructive" : ""
                        }`}
                        disabled={isSubmitting}
                      />
                    )}

                    {/* Input Tipe: file */}
                    {field.type === "file" && (
                      <div
                        className={`rounded-xl border border-dashed p-4 text-center transition-colors cursor-pointer ${
                          fieldError
                            ? "border-destructive bg-destructive/5"
                            : fileData[field.id]
                            ? "border-emerald-500 bg-emerald-500/5"
                            : "border-border bg-muted/10 hover:bg-muted/20"
                        }`}
                        onClick={() => {
                          const el = document.getElementById(`file_input_${field.id}`);
                          if (el) el.click();
                        }}
                      >
                        <input
                          id={`file_input_${field.id}`}
                          type="file"
                          className="hidden"
                          accept={
                            field.validation?.fileConfig?.allowedTypes
                              ?.map((t) => (t === "image" ? "image/*" : ".pdf,application/pdf"))
                              ?.join(",") || "image/*,.pdf"
                          }
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileChange(field, file);
                          }}
                          disabled={isSubmitting}
                        />
                        <UploadCloud className="h-6 w-6 text-muted-foreground mx-auto mb-1.5" />
                        {fileData[field.id] ? (
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {fileData[field.id].name} ({(fileData[field.id].size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        ) : (
                          <p className="text-xs font-medium text-foreground">
                            {field.placeholder || "Klik untuk memilih berkas dari perangkat Anda"}
                          </p>
                        )}
                        <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
                          {field.validation?.fileConfig?.allowedTypes?.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                            >
                              {t === "image" ? (
                                <>
                                  <ImageIcon className="h-2.5 w-2.5" />
                                  <span>Gambar</span>
                                </>
                              ) : (
                                <>
                                  <FileText className="h-2.5 w-2.5" />
                                  <span>PDF</span>
                                </>
                              )}
                            </span>
                          ))}
                          <span className="text-[10px] text-muted-foreground">
                            Maks. {field.validation?.fileConfig?.maxSizeMb || 2} MB
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Input Tipe: select */}
                    {field.type === "select" && (
                      <Select
                        value={formData[field.id] || ""}
                        onValueChange={(val) => handleInputChange(field.id, val)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger
                          className={`h-9 text-xs w-full ${
                            fieldError ? "border-destructive focus-visible:ring-destructive" : ""
                          }`}
                        >
                          <SelectValue placeholder={field.placeholder || "Pilih opsi"} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.validation?.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Input Tipe: radio */}
                    {field.type === "radio" && (
                      <RadioGroup
                        value={formData[field.id] || ""}
                        onValueChange={(val) => handleInputChange(field.id, val)}
                        className="space-y-1.5 pt-1"
                        disabled={isSubmitting}
                      >
                        {field.validation?.options?.map((opt) => (
                          <label
                            key={opt.value}
                            className="flex items-center gap-2 cursor-pointer text-xs p-2 rounded-lg border border-border/50 hover:bg-muted/30"
                          >
                            <RadioGroupItem value={opt.value} />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </RadioGroup>
                    )}

                    {/* Input Tipe: checkbox */}
                    {field.type === "checkbox" && (
                      <div className="space-y-2 pt-0.5">
                        {field.validation?.options &&
                        field.validation.options.length > 0 ? (
                          <div className="space-y-1.5">
                            {field.validation.options.map((opt) => {
                              const isChecked =
                                Array.isArray(formData[field.id]) &&
                                formData[field.id].includes(opt.value);

                              return (
                                <label
                                  key={opt.value}
                                  className={`flex items-center gap-2 cursor-pointer text-xs p-2.5 rounded-lg border transition-colors ${
                                    isChecked
                                      ? "border-primary bg-primary/5"
                                      : "border-border/50 hover:bg-muted/30"
                                  }`}
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(c) =>
                                      handleCheckboxGroupChange(
                                        field.id,
                                        opt.value,
                                        Boolean(c)
                                      )
                                    }
                                    disabled={isSubmitting}
                                  />
                                  <span>{opt.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <label className="flex items-center gap-2 cursor-pointer text-xs p-2.5 rounded-lg border border-border/50 hover:bg-muted/30">
                            <Checkbox
                              checked={Boolean(formData[field.id])}
                              onCheckedChange={(c) =>
                                handleInputChange(field.id, Boolean(c))
                              }
                              disabled={isSubmitting}
                            />
                            <span className="text-xs text-foreground font-medium">
                              {field.placeholder || field.label}
                            </span>
                          </label>
                        )}
                      </div>
                    )}

                    {/* Field Error Message */}
                    {fieldError ? (
                      <p className="text-[11px] font-medium text-destructive">
                        {fieldError}
                      </p>
                    ) : field.helperText ? (
                      <p className="text-[11px] text-muted-foreground">
                        {field.helperText}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {/* Submit Button Bar */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || isSpamBlocked}
          className="w-full cursor-pointer h-11 text-sm font-semibold shadow-md gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Mengirimkan Pendaftaran...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Kirim Formulir Pendaftaran</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
