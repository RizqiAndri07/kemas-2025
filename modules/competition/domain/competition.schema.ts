import { z } from "zod";
import { CompetitionType } from "./competition-type.enum";
import { CompetitionStatus } from "./competition-status.enum";

export const priceListItemSchema = z.object({
  id: z.string().min(1, "ID tier tidak boleh kosong"),
  name: z.string().min(1, "Nama price list wajib diisi"),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
});

export type PriceListItemInput = z.infer<typeof priceListItemSchema>;

export const competitionDocumentItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama dokumen wajib diisi"),
  filePath: z.string().min(1, "Berkas dokumen PDF wajib diunggah"),
});

export type CompetitionDocumentItemInput = z.infer<typeof competitionDocumentItemSchema>;

export const competitionFormSchema = z
  .object({
    name: z
      .string()
      .min(3, "Nama kompetisi minimal 3 karakter")
      .max(200, "Nama kompetisi maksimal 200 karakter"),
    type: z.enum([CompetitionType.EVENT, CompetitionType.TOURNAMENT], {
      message: "Pilih tipe kegiatan yang valid (Event atau Tournament)",
    }),
    registrationStartDate: z.string().min(1, "Tanggal buka pendaftaran wajib diisi"),
    registrationEndDate: z.string().min(1, "Tanggal close register wajib diisi"),
    eventStartDate: z.string().min(1, "Tanggal dimulai acara wajib diisi"),
    eventEndDate: z.string().min(1, "Tanggal selesai acara wajib diisi"),
    fee: z.coerce
      .number({ message: "Biaya pendaftaran harus berupa angka" })
      .min(0, "Biaya pendaftaran tidak boleh negatif (isi 0 jika gratis)")
      .optional()
      .default(0),
    priceList: z
      .array(priceListItemSchema)
      .min(1, "Minimal harus ada 1 item price list")
      .default([{ id: "default", name: "Normal Price", price: 0 }]),
    selectedPriceId: z.string().min(1, "Pilih salah satu price list aktif").default("default"),
    contactPersonIds: z.array(z.string()).optional().default([]),
    guidebookUrl: z.string().optional().nullable().or(z.literal("")),
    documents: z.array(competitionDocumentItemSchema).optional().default([]),
    description: z.string().optional().or(z.literal("")),
    maxQuota: z.coerce
      .number({ message: "Kuota harus berupa angka" })
      .min(1, "Kuota minimal 1 peserta/tim")
      .optional()
      .or(z.literal(0))
      .or(z.null()),
    noRegistrationNeeded: z.boolean().default(false),
    activeFormId: z.string().uuid("ID formulir tidak valid").optional().nullable().or(z.literal("")),
    status: z
      .enum([
        CompetitionStatus.OPEN,
        CompetitionStatus.CLOSED,
        CompetitionStatus.UPCOMING,
        CompetitionStatus.COMPLETED,
      ])
      .default(CompetitionStatus.CLOSED),
  })
  .refine(
    (data) => {
      const start = new Date(data.registrationStartDate).getTime();
      const end = new Date(data.registrationEndDate).getTime();
      return end >= start;
    },
    {
      message: "Tanggal close register tidak boleh mendahului tanggal buka pendaftaran",
      path: ["registrationEndDate"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.eventStartDate).getTime();
      const end = new Date(data.eventEndDate).getTime();
      return end >= start;
    },
    {
      message: "Tanggal selesai acara tidak boleh mendahului tanggal dimulai acara",
      path: ["eventEndDate"],
    }
  );

export type CompetitionFormInput = z.infer<typeof competitionFormSchema>;
