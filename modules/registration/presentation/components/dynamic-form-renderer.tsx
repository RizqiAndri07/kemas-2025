"use client";

import { useState } from "react";
import {
  FormSectionConfig,
  FormFieldConfig,
} from "@/modules/competition/domain/competition-form.interface";
import { CompetitionSelect } from "@/modules/competition/infrastructure/competition.table";
import { CompetitionFormSelect } from "@/modules/competition/infrastructure/competition-form.table";
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
import { toast } from "@/components/ui/sonner";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Send,
} from "lucide-react";

interface DynamicFormRendererProps {
  competition: CompetitionSelect;
  form: CompetitionFormSelect;
  onSubmitAction?: (
    answers: Record<string, any>
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
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
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sections: FormSectionConfig[] = form.sections || [];

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error for this field
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

        // Tipe specific validation
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

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
          toast.error(msg);
          setIsSubmitting(false);
          return;
        }
        toast.success(res.message || "Pendaftaran berhasil dikirim!");
      }

      setIsSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan pada sistem.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/[0.03] shadow-md max-w-2xl mx-auto p-6 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-heading font-bold text-foreground">
            Pendaftaran Berhasil Dikirim!
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Terima kasih telah mendaftar pada kegiatan{" "}
            <strong className="text-foreground">{competition.name}</strong>. Data Anda telah tercatat pada sistem panitia.
          </p>
        </div>
        <div className="pt-2">
          <Button
            size="sm"
            onClick={() => {
              setIsSuccess(false);
              setFormData({});
              setFileData({});
            }}
            variant="outline"
            className="text-xs"
          >
            Kirim Respons Baru
          </Button>
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
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              Pendaftaran: {competition.name}
            </span>
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

      {/* Global Error Banner */}
      {submitError && (
        <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Sections */}
      {sections.map((section, sIdx) => (
        <Card key={section.id || sIdx} className="border-border/70 shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-border/50 bg-muted/15">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                {sIdx + 1}
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
            {section.fields.map((field) => {
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
                            .map((t) => (t === "image" ? "image/*" : ".pdf,application/pdf"))
                            .join(",") || "image/*,.pdf"
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
                        {field.validation?.fileConfig?.allowedTypes.map((t) => (
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

                  {/* Input Tipe: checkbox (Multi-Option Group vs Single Checkbox) */}
                  {field.type === "checkbox" && (
                    <div className="space-y-2 pt-0.5">
                      {field.validation?.options &&
                      field.validation.options.length > 0 ? (
                        <div className="space-y-1.5">
                          {field.validation.options.map((opt) => {
                            const isChecked = Array.isArray(formData[field.id]) &&
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
      ))}

      {/* Submit Button Bar */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
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
