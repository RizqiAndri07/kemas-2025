import { z } from "zod";

export const contactPersonFormSchema = z.object({
  name: z
    .string()
    .min(2, "Nama narahubung minimal 2 karakter")
    .max(150, "Nama narahubung maksimal 150 karakter"),
  phone: z
    .string()
    .min(8, "Nomor HP minimal 8 digit")
    .max(30, "Nomor HP maksimal 30 karakter")
    .regex(
      /^(\+62|62|0)[0-9\- ]{7,20}$/,
      "Format nomor HP tidak valid (contoh: 081234567890 atau +6281234567890)"
    ),
});

export type ContactPersonFormInput = z.infer<typeof contactPersonFormSchema>;
