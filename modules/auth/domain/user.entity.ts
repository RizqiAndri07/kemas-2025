import { UserRole } from "./role.enum";
import { UserStatus } from "./user-status.enum";

export interface UserEntity {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
