export const UserRole = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  CMS_WRITER: "CMS_WRITER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
