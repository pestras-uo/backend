import { UserTitle } from "../../models/auth/user/interface";

export interface LoginBody {
  usernameOrEmail: string;
  password: string;
  remember: boolean;
}

export interface SignUpBody {
  organization: string;
  username: string;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  title: UserTitle;
}

export interface ResendActiviationEmailBody {
  email: string;
  password: string;
}

export interface ResetPasswordBody {
  password: string;
}