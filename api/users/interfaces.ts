import { UserProfile } from "../../models/auth/user/interface";

export interface ChangeUsernameBody {
  username: string
}

export interface ChangeEmailBody {
  email: string;
  isBackup: boolean;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileBody extends UserProfile {}