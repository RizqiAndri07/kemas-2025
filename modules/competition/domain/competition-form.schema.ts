import { z } from "zod";
import { FormFieldType } from "./competition-form.interface";

export const formFieldValidationSchema = z.object({
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
  fileConfig: z
    .object({
      allowedTypes: z.array(z.enum(["image", "pdf"])).min(1, "Pilih minimal 1 jenis berkas yang diizinkan"),
      maxSizeMb: z.coerce.number().min(1).max(20).default(2),
    })
    .optional(),
  options: z
    .array(
      z.object({
        label: z.string().min(1, "Label opsi tidak boleh kosong"),
        value: z.string().min(1, "Nilai opsi tidak boleh kosong"),
      })
    )
    .optional(),
});

export const formFieldConfigSchema = z.object({
  id: z
    .string()
    .min(1, "ID field wajib diisi")
    .regex(/^[a-zA-Z0-9_-]+$/, "ID field hanya boleh berisi huruf, angka, underscore, atau dash"),
  label: z.string().min(1, "Label field wajib diisi"),
  placeholder: z.string().optional(),
  helperText: z.string().optional(),
  type: z.enum([
    "text",
    "textarea",
    "number",
    "file",
    "url",
    "select",
    "radio",
    "checkbox",
  ] as const),
  required: z.boolean().default(false),
  order: z.number().default(0),
  validation: formFieldValidationSchema.optional(),
});

export const formSectionConfigSchema = z.object({
  id: z.string().min(1, "ID section wajib diisi"),
  title: z.string().min(1, "Judul section wajib diisi"),
  description: z.string().optional(),
  order: z.number().default(0),
  fields: z.array(formFieldConfigSchema).default([]),
});

export const createCompetitionFormMetaSchema = z.object({
  competitionId: z.string().uuid("ID kompetisi tidak valid"),
  title: z
    .string()
    .min(3, "Judul formulir minimal 3 karakter")
    .max(255, "Judul formulir maksimal 255 karakter"),
  description: z.string().optional().nullable(),
});

export const saveCompetitionFormSchema = z.object({
  id: z.string().uuid("ID formulir tidak valid"),
  competitionId: z.string().uuid("ID kompetisi tidak valid"),
  title: z
    .string()
    .min(3, "Judul formulir minimal 3 karakter")
    .max(255, "Judul formulir maksimal 255 karakter"),
  description: z.string().optional().nullable(),
  sections: z.array(formSectionConfigSchema).default([]),
});

export type FormFieldConfigInput = z.infer<typeof formFieldConfigSchema>;
export type FormSectionConfigInput = z.infer<typeof formSectionConfigSchema>;
export type CreateCompetitionFormMetaInput = z.infer<typeof createCompetitionFormMetaSchema>;
export type SaveCompetitionFormInput = z.infer<typeof saveCompetitionFormSchema>;
