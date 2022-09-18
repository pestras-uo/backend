import config from '../config';
import { verify } from 'jsonwebtoken';

import usersModel from '../models/auth/user';
import authModel from '../models/auth/auth';
import { HttpError } from '../misc/errors';
import { HttpCode } from '../misc/http-codes';

export enum TokenType {
  API,
  PASSWORD,
  EMAIL,
  SHARE
}

export interface TokenData<T = any> {
  id: string;
  type: TokenType;
  date: number;
  remember?: boolean;
  duration?: number;
  payload?: T;
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

  const userId = tokenData.id;

  // confirm token has the matched type
  if (tokenData.type !== type)
    throw new HttpError(HttpCode.INVALID_TOKEN, "invalidTokenType");

  // Check token expire date
  if (tokenData.type === TokenType.API) {
    if (!(await authModel.hasSession(userId, token)))
      throw new HttpError(HttpCode.INVALID_TOKEN, "outDatedToken");

    let expired = false;

    if (tokenData.remember) {
      if (Date.now() - tokenData.date > config.rememberApiTokenExpiry)
        expired = true;

    } else {
      if (Date.now() - tokenData.date > config.apiTokenExpiry)
        expired = true;
    }

    if (expired) {
      await authModel.endSession(userId);
      throw new HttpError(HttpCode.INVALID_TOKEN, "tokenExpired");
    }

  } else if (tokenData.type === TokenType.EMAIL) {
    if (Date.now() - tokenData.date > config.emailTokenExpiry)
      throw new HttpError(HttpCode.INVALID_TOKEN, "tokenExpired");

  } else if (tokenData.type === TokenType.PASSWORD) {
    if (Date.now() - tokenData.date > config.passwordTokenExpiry)
      throw new HttpError(HttpCode.INVALID_TOKEN, "tokenExpired");

  } else if (tokenData.type === TokenType.SHARE) {
    if (tokenData.duration && Date.now() - tokenData.date > tokenData.duration)
      throw new HttpError(HttpCode.INVALID_TOKEN, "tokenExpired");
  }

  const user = await usersModel.get(userId);

  if (!user)
    throw new HttpError(HttpCode.UNAUTHORIZED, "userNotFound");

  return { user, tokenData };
}