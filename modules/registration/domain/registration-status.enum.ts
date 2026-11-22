import { pgEnum } from "drizzle-orm/pg-core";

export const registrationStatusEnum = pgEnum("registration_status", [
  "UNVERIFIED",
  "VERIFIED",
  "REJECTED",
]);

export type RegistrationStatus = (typeof registrationStatusEnum.enumValues)[number];

export const RegistrationStatusLabels: Record<RegistrationStatus, string> = {
  UNVERIFIED: "Belum Terverifikasi",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
};
