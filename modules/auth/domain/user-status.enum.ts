export const UserStatus = {
  VERIFIED: "verified",
  UNVERIFIED: "unverified",
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
