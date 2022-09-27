import config from '../config';
import { verify } from 'jsonwebtoken';

import usersModel from '../models/auth/user';
import authModel from '../models/auth/auth';
import { HttpError } from '../misc/errors';
import { HttpCode } from '../misc/http-codes';

export enum TokenType {
  SESSION,
  API
}

export interface TokenMeta {
  TOKEN: string;
  TOKEN_CREATE_DATE: Date;
  TOKEN_EXP_DATE: Date;
}

export interface TokenData<T = any> {
  id: string;
  type: TokenType;
}

export async function verifyToken(token: string, type: TokenType) {
  let tokenData: TokenData;

  if (!token)
    throw new HttpError(HttpCode.TOKEN_REQUIRED, "unauthorized");

  try {
    tokenData = verify(token, config.tokenSecret) as TokenData;
  } catch (error: any) {
    throw new HttpError(HttpCode.INVALID_TOKEN, "invalidToken");
  }

  if (!tokenData.id)
    throw new HttpError(HttpCode.INVALID_TOKEN, "invalidTokenData");

  // confirm token has the matched type
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
  if (!(await authModel.hasSession(user_id, token)))
    throw new HttpError(HttpCode.INVALID_TOKEN, "outDatedToken");

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

