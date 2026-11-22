import { z } from "zod";
import { registrationStatusEnum } from "./registration-status.enum";

export const updateRegistrationStatusSchema = z.object({
  id: z.string().uuid("ID registrasi tidak valid"),
  status: z.enum(registrationStatusEnum.enumValues, {
    message: "Status registrasi tidak valid",
  }),
  notes: z.string().max(1000, "Catatan maksimal 1000 karakter").optional().nullable(),
});

export type UpdateRegistrationStatusInput = z.infer<typeof updateRegistrationStatusSchema>;

export const submitRegistrationSchema = z.object({
  competitionId: z.string().uuid("ID kompetisi tidak valid"),
  formId: z.string().uuid("ID formulir tidak valid"),
  data: z.record(z.string(), z.any()),
  files: z
    .array(
      z.object({
        fieldName: z.string(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .default([]),
});

export type SubmitRegistrationInput = z.infer<typeof submitRegistrationSchema>;
