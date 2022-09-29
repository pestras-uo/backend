import { HttpError } from "../misc/errors";
import { HttpCode } from "../misc/http-codes";
import { TokenMeta, TokenType, verify } from "./token";

import usersModel from '../models/auth/user';
import authModel from '../models/auth/auth';
import { UserDetails } from "../models/auth/user/interface";

export interface UserSession {
  user: UserDetails;
  session: {
    TOKEN: string,
    TOKEN_CREATE_DATE: Date,
    TOKEN_EXP_DATE: Date
  }
}

export function verifyToken(token: string, type: TokenType) {
  const tokenData = verify(token);

  if (tokenData.type !== type)
    throw new HttpError(HttpCode.INVALID_TOKEN, "invalidTokenType");

  // Check token expire date
  if (tokenData.type === TokenType.SESSION) {
    return validateSessionToken(tokenData.id, token);

  }
  // else if (tokenData.type === TokenType.API) {
  //   // TODO: validate api token
  //   return validateApiAccess(tokenData.id);
  // }
  return null;
}

// validate session
// ----------------------------------------------------------------------------------------------------------
async function validateSessionToken(user_id: string, token: string) {
  const session = await authModel.getSessionByToken(user_id, token);

  if (!session)
    throw new HttpError(HttpCode.INVALID_TOKEN, "tokenExpired");

  if (session.TOKEN_EXP_DATE?.getTime()! < Date.now()) {
    console.log('expired');
    await authModel.endSession(user_id);
    throw new HttpError(HttpCode.INVALID_TOKEN, "tokenExpired");
  }

  const user = await usersModel.get(user_id);

  if (!user)
    throw new HttpError(HttpCode.UNAUTHORIZED, "tokenExpired");

  return {
    user,
    session: {
      TOKEN: token,
      TOKEN_CREATE_DATE: session.TOKEN_CREATE_DATE,
      TOKEN_EXP_DATE: session.TOKEN_EXP_DATE
    } as TokenMeta
  };
}




// validate api access
// ----------------------------------------------------------------------------------------------------------
async function validateApiAccess(api_id: string) {
  return false;
}