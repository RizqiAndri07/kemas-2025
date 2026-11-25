import { UserRole } from "../domain/role.enum";
import { UserStatus } from "../domain/user-status.enum";

export interface UserSelect {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInsert {
  id?: string;
  username: string;
  email: string;
  role?: UserRole;
  status?: UserStatus;
  lastLogin?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
