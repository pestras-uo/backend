import { UserDetails } from "../models/auth/user/interface";
import { TokenData } from "./token";

export interface ResLocals {
  user: UserDetails;
  token: string;
  tokenData: TokenData;
}