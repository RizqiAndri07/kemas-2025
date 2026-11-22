import { z } from "zod";

export const presaleFormSchema = z
  .object({
    competitionId: z.string().uuid("Pilih kompetisi yang valid"),
    name: z
      .string()
      .min(2, "Nama gelombang presale minimal 2 karakter")
      .max(150, "Nama gelombang presale maksimal 150 karakter"),
    price: z.coerce
      .number({ message: "Biaya pendaftaran harus berupa angka" })
      .min(0, "Biaya tidak boleh negatif (isi 0 jika gratis)"),
    startDate: z.string().min(1, "Tanggal mulai berlaku wajib diisi"),
    endDate: z.string().min(1, "Tanggal berakhir berlaku wajib diisi"),
    quota: z.coerce
      .number({ message: "Kuota harus berupa angka" })
      .min(1, "Kuota minimal 1 peserta/tim")
      .optional()
      .or(z.literal(0))
      .or(z.null()),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate).getTime();
      const end = new Date(data.endDate).getTime();
      return end >= start;
    },
    {
      message: "Tanggal berakhir tidak boleh mendahului tanggal mulai gelombang",
      path: ["endDate"],
    }
  );

export type PresaleFormInput = z.infer<typeof presaleFormSchema>;
