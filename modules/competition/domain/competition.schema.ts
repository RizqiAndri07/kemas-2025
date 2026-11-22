import { z } from "zod";
import { CompetitionType } from "./competition-type.enum";
import { CompetitionStatus } from "./competition-status.enum";

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
      .min(0, "Biaya pendaftaran tidak boleh negatif (isi 0 jika gratis)"),
    description: z.string().optional().or(z.literal("")),
    maxQuota: z.coerce
      .number({ message: "Kuota harus berupa angka" })
      .min(1, "Kuota minimal 1 peserta/tim")
      .optional()
      .or(z.literal(0))
      .or(z.null()),
    status: z
      .enum([
        CompetitionStatus.OPEN,
        CompetitionStatus.CLOSED,
        CompetitionStatus.UPCOMING,
        CompetitionStatus.COMPLETED,
      ])
      .default(CompetitionStatus.OPEN),
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
