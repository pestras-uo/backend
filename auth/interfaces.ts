import { UserDetails } from "../models/auth/user/interface";
import { TokenData } from "./token";

export interface ResLocals {
  user: UserDetails;
  session: {
    TOKEN: string,
    TOKEN_CREATE_DATE: Date,
    TOKEN_EXP_DATE: Date
  }
}