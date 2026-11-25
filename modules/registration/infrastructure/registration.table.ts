import { RegistrationStatus } from "../domain/registration-status.enum";

export interface RegistrationUploadedFile {
  fieldName: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface RegistrationSelect {
  id: string;
  competitionId: string;
  formId: string;
  registrationNumber: string;
  data: Record<string, any>;
  files: RegistrationUploadedFile[];
  status: RegistrationStatus;
  notes: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistrationInsert {
  id?: string;
  competitionId: string;
  formId: string;
  registrationNumber?: string;
  data: Record<string, any>;
  files?: RegistrationUploadedFile[];
  status?: RegistrationStatus;
  notes?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  verifiedAt?: Date | null;
  verifiedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
