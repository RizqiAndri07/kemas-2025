import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createUserWithPasswordSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(/^[a-zA-Z0-9_.-]+$/, {
      message: "Username hanya boleh huruf, angka, titik, underscore, dan strip",
    }),
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Kata sandi awal minimal 8 karakter"),
  role: z.enum(["SUPERADMIN", "ADMIN", "CMS_WRITER"], {
    message: "Pilih peran pengguna yang valid",
  }),
});

export type CreateUserWithPasswordInput = z.infer<typeof createUserWithPasswordSchema>;

// Schema untuk Update / Setup Kata Sandi Mandiri oleh Pengguna
export const setupPasswordSchema = z
  .object({
    token: z.string().min(1, "Token verifikasi wajib disertakan"),
    password: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter")
      .regex(/[a-zA-Z]/, "Kata sandi wajib memuat huruf")
      .regex(/[0-9]/, "Kata sandi wajib memuat angka"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export type SetupPasswordInput = z.infer<typeof setupPasswordSchema>;

// Schema untuk Reset Kata Sandi
export const resetPasswordSchema = setupPasswordSchema;
export type ResetPasswordInput = SetupPasswordInput;
