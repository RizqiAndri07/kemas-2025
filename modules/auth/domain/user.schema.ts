import { z } from "zod";

// Schema untuk Tambah Pengguna Baru oleh Superadmin (tanpa input password manual)
export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(/^[a-zA-Z0-9_.-]+$/, {
      message: "Username hanya boleh huruf, angka, titik, underscore, dan strip",
    }),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  role: z.enum(["SUPERADMIN", "ADMIN", "CMS_WRITER"], {
    message: "Pilih peran pengguna yang valid",
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// Schema untuk Edit Pengguna oleh Superadmin (password opsional jika ingin mengubah langsung)
export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(/^[a-zA-Z0-9_.-]+$/, {
      message: "Username hanya boleh huruf, angka, titik, underscore, dan strip",
    }),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  role: z.enum(["SUPERADMIN", "ADMIN", "CMS_WRITER"], {
    message: "Pilih peran pengguna yang valid",
  }),
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .optional()
    .or(z.literal("")),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Backwards compatibility alias
export const userFormSchema = updateUserSchema;
export type UserFormInput = UpdateUserInput;
