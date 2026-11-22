import { z } from "zod";

export const blogFormSchema = z.object({
  title: z
    .string()
    .min(5, "Judul artikel minimal 5 karakter")
    .max(255, "Judul artikel maksimal 255 karakter"),
  description: z
    .string()
    .min(10, "Konten/deskripsi artikel minimal 10 karakter"),
  tag: z.string().max(255).optional().nullable(),
  status: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  commentStatus: z.boolean().default(true),
});

export type BlogFormInput = z.infer<typeof blogFormSchema>;

export const commentFormSchema = z.object({
  blogId: z.string().uuid("ID Blog tidak valid"),
  name: z.string().min(2, "Nama minimal 2 karakter").max(150),
  email: z.string().email("Format email tidak valid").optional().nullable(),
  content: z.string().min(3, "Komentar minimal 3 karakter"),
});

export type CommentFormInput = z.infer<typeof commentFormSchema>;
