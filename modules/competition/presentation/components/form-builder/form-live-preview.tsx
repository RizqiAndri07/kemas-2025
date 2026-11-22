"use client";

import { useState } from "react";
import {
  FormSectionConfig,
  FormFieldConfig,
} from "@/modules/competition/domain/competition-form.interface";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Eye,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface FormLivePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formTitle: string;
  formDescription?: string | null;
  sections: FormSectionConfig[];
}

export function FormLivePreview({
  open,
  onOpenChange,
  formTitle,
  formDescription,
  sections,
}: FormLivePreviewProps) {
  // Local state for simulating user input
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fileData, setFileData] = useState<Record<string, File>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

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

    for (const section of sections) {
      for (const field of section.fields) {
        const val = formData[field.id];

        // 1. Required Check
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

        // 2. Format & Value Check
        if (val !== undefined && val !== null && val !== "") {
          if (field.type === "url") {
            try {
              new URL(val);
            } catch {
              newErrors[field.id] =
                "Format URL tidak valid (harus diawali http:// atau https://).";
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
            const strLen = String(val).trim().length;
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

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const isValid = validateAll();
    if (!isValid) {
      setSubmitError(
        "Gagal mengirim formulir."
      );
      return;
    }

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Eye className="h-4 w-4" />
            <span>Mode Pratinjau Langsung (Peserta)</span>
          </div>
          <DialogTitle className="text-xl font-heading font-bold text-foreground">
            {formTitle || "Formulir Pendaftaran"}
          </DialogTitle>
          {formDescription && (
            <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
              {formDescription}
            </DialogDescription>
          )}
        </DialogHeader>

        {submitted && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Simulasi Pengiriman Formulir Berhasil!</p>
              <p className="text-[11px] text-muted-foreground">
                Seluruh section dan field wajib berhasil divalidasi dengan sukses.
              </p>
            </div>
          </div>
        )}

        {submitError && (
          <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSimulateSubmit} className="space-y-6 py-2">
          {sections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              Belum ada section atau field input yang ditambahkan ke formulir ini.
            </div>
          ) : (
            sections.map((section, sIdx) => (
              <div
                key={section.id || sIdx}
                className="rounded-xl border border-border/70 p-4 space-y-4 bg-card/60 shadow-xs"
              >
                {/* Section Header */}
                <div className="border-b border-border/40 pb-2.5">
                  <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px]">
                      {sIdx + 1}
                    </span>
                    <span>{section.title}</span>
                  </h3>
                  {section.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {section.description}
                    </p>
                  )}
                </div>

                {/* Section Fields */}
                <div className="space-y-4">
                  {section.fields.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      Belum ada field di section ini.
                    </p>
                  ) : (
                    section.fields.map((field: FormFieldConfig) => {
                      const fieldError = errors[field.id];

                      return (
                        <div key={field.id} className="space-y-1.5">
                          <Label
                            htmlFor={`preview_${field.id}`}
                            className={`text-xs font-medium flex items-center gap-1 ${
                              fieldError ? "text-destructive" : "text-foreground"
                            }`}
                          >
                            <span>{field.label}</span>
                            {field.required && (
                              <span className="text-destructive font-bold">*</span>
                            )}
                          </Label>

                          {/* Text / Input Pendek */}
                          {field.type === "text" && (
                            <Input
                              id={`preview_${field.id}`}
                              placeholder={field.placeholder || "Ketik jawaban Anda..."}
                              value={formData[field.id] || ""}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              className={`h-9 text-xs ${
                                fieldError ? "border-destructive focus-visible:ring-destructive" : ""
                              }`}
                            />
                          )}

                          {/* Textarea / Input Panjang */}
                          {field.type === "textarea" && (
                            <Textarea
                              id={`preview_${field.id}`}
                              placeholder={field.placeholder || "Ketik jawaban lengkap Anda..."}
                              value={formData[field.id] || ""}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              rows={3}
                              className={`text-xs resize-none ${
                                fieldError ? "border-destructive focus-visible:ring-destructive" : ""
                              }`}
                            />
                          )}

                          {/* Number */}
                          {field.type === "number" && (
                            <Input
                              id={`preview_${field.id}`}
                              type="number"
                              placeholder={field.placeholder || "Masukkan angka..."}
                              min={field.validation?.min}
                              max={field.validation?.max}
                              value={formData[field.id] || ""}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              className={`h-9 text-xs ${
                                fieldError ? "border-destructive focus-visible:ring-destructive" : ""
                              }`}
                            />
                          )}

                          {/* Link / URL */}
                          {field.type === "url" && (
                            <Input
                              id={`preview_${field.id}`}
                              type="url"
                              placeholder={field.placeholder || "https://..."}
                              value={formData[field.id] || ""}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              className={`h-9 text-xs ${
                                fieldError ? "border-destructive focus-visible:ring-destructive" : ""
                              }`}
                            />
                          )}

                          {/* File Upload Box - Working Click Handler */}
                          {field.type === "file" && (
                            <div
                              className={`rounded-xl border border-dashed p-4 text-center cursor-pointer transition-colors ${
                                fieldError
                                  ? "border-destructive bg-destructive/5"
                                  : fileData[field.id]
                                  ? "border-emerald-500 bg-emerald-500/5"
                                  : "border-border bg-muted/10 hover:bg-muted/20"
                              }`}
                              onClick={() => {
                                const inputEl = document.getElementById(
                                  `preview_file_input_${field.id}`
                                );
                                if (inputEl) inputEl.click();
                              }}
                            >
                              <input
                                type="file"
                                id={`preview_file_input_${field.id}`}
                                className="hidden"
                                accept={
                                  field.validation?.fileConfig?.allowedTypes
                                    .map((t) =>
                                      t === "image" ? "image/*" : ".pdf,application/pdf"
                                    )
                                    .join(",") || "image/*,.pdf"
                                }
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  handleFileChange(field, file);
                                }}
                              />
                              <UploadCloud className="h-6 w-6 text-muted-foreground mx-auto mb-1.5" />
                              {fileData[field.id] ? (
                                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                  {fileData[field.id].name} (
                                  {(fileData[field.id].size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                              ) : (
                                <p className="text-xs font-medium text-foreground">
                                  {field.placeholder || "Klik untuk memilih berkas dari komputer Anda"}
                                </p>
                              )}
                              <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
                                {field.validation?.fileConfig?.allowedTypes.map((t: string) => (
                                  <span
                                    key={t}
                                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                                  >
                                    {t === "image" ? (
                                      <>
                                        <ImageIcon className="h-2.5 w-2.5" />
                                        <span>Gambar (JPG, PNG)</span>
                                      </>
                                    ) : (
                                      <>
                                        <FileText className="h-2.5 w-2.5" />
                                        <span>Dokumen PDF</span>
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

                          {/* Select Dropdown */}
                          {field.type === "select" && (
                            <Select
                              value={formData[field.id] || ""}
                              onValueChange={(val) => handleInputChange(field.id, val)}
                            >
                              <SelectTrigger
                                className={`h-9 text-xs w-full ${
                                  fieldError
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                                }`}
                              >
                                <SelectValue placeholder={field.placeholder || "Pilih opsi"} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.validation?.options?.map(
                                  (opt: { label: string; value: string }) => (
                                    <SelectItem
                                      key={opt.value}
                                      value={opt.value}
                                      className="text-xs"
                                    >
                                      {opt.label}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          )}

                          {/* Radio Group */}
                          {field.type === "radio" && (
                            <RadioGroup
                              value={formData[field.id] || ""}
                              onValueChange={(val) => handleInputChange(field.id, val)}
                              className="space-y-1.5 pt-1"
                            >
                              {field.validation?.options?.map(
                                (opt: { label: string; value: string }) => (
                                  <label
                                    key={opt.value}
                                    className={`flex items-center gap-2 cursor-pointer text-xs p-2 rounded-lg border transition-colors ${
                                      formData[field.id] === opt.value
                                        ? "border-primary bg-primary/5"
                                        : "border-border/50 hover:bg-muted/30"
                                    }`}
                                  >
                                    <RadioGroupItem value={opt.value} />
                                    <span>{opt.label}</span>
                                  </label>
                                )
                              )}
                            </RadioGroup>
                          )}

                          {/* Checkbox: Multi-Checkbox Group vs Single Checkbox */}
                          {field.type === "checkbox" && (
                            <div className="space-y-2 pt-0.5">
                              {field.validation?.options &&
                              field.validation.options.length > 0 ? (
                                <div className="space-y-1.5">
                                  {field.validation.options.map(
                                    (opt: { label: string; value: string }) => {
                                      const isChecked = Array.isArray(formData[field.id]) &&
                                        formData[field.id].includes(opt.value);

                                      return (
                                        <label
                                          key={opt.value}
                                          className={`flex items-center gap-2 cursor-pointer text-xs p-2 rounded-lg border transition-colors ${
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
                                          />
                                          <span>{opt.label}</span>
                                        </label>
                                      );
                                    }
                                  )}
                                </div>
                              ) : (
                                <label className="flex items-center gap-2 cursor-pointer text-xs p-2 rounded-lg border border-border/50 hover:bg-muted/30">
                                  <Checkbox
                                    checked={Boolean(formData[field.id])}
                                    onCheckedChange={(c) =>
                                      handleInputChange(field.id, Boolean(c))
                                    }
                                  />
                                  <span>{field.placeholder || field.label}</span>
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
                    })
                  )}
                </div>
              </div>
            ))
          )}

          {sections.length > 0 && (
            <div className="pt-2">
              <Button
                type="submit"
                size="sm"
                className="w-full cursor-pointer h-9 text-xs font-medium"
              >
                Kirim Pendaftaran (Simulasi)
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
