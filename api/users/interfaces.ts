export interface ChangeUsernameBody {
  username: string
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileBody {
  fullname: string;
  email: string;
  mobile: string;
}

export interface UpdateAvatarBody {
  avatar: string;
}