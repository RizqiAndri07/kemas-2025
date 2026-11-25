export const REGISTRATION_STATUS_VALUES = [
  "UNVERIFIED",
  "VERIFIED",
  "REJECTED",
] as const;

export const registrationStatusEnum = {
  enumValues: REGISTRATION_STATUS_VALUES,
};

export type RegistrationStatus = (typeof REGISTRATION_STATUS_VALUES)[number];

export const RegistrationStatusLabels: Record<RegistrationStatus, string> = {
  UNVERIFIED: "Belum Terverifikasi",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
};

