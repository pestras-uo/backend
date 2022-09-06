import { User } from "../models/user/doc";
import { TokenData } from "./token";

export interface ResLocals {
  user: User;
  token: string;
  tokenData: TokenData;
}