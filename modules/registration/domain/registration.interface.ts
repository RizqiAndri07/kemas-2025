import { RegistrationStatus } from "./registration-status.enum";
import { RegistrationUploadedFile } from "../infrastructure/registration.table";

export interface RegistrationItem {
  id: string;
  competitionId: string;
  competitionName: string;
  competitionType: string;
  formId: string;
  formTitle: string;
  formSections?: any[];
  registrationNumber: string;
  email?: string | null;
  data: Record<string, any>;
  files: RegistrationUploadedFile[];
  status: RegistrationStatus;
  notes: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  verifiedByUsername?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistrationFilterParams {
  competitionId?: string;
  status?: RegistrationStatus | "ALL";
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "registrationNumber" | "status";
  sortOrder?: "asc" | "desc";
}

export interface RegistrationListResult {
  data: RegistrationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RegistrationStats {
  total: number;
  unverified: number;
  verified: number;
  rejected: number;
}

export interface UpdateRegistrationStatusResult {
  id: string;
  status: RegistrationStatus;
  emailSent?: boolean;
  emailRecipient?: string | null;
  emailError?: string | null;
}

