import config from '../config';
import { verify } from 'jsonwebtoken';

import usersModel from '../models/user';
import authModel from '../models/auth';
import { HttpError } from '../misc/errors';
import { HttpCode } from '../misc/http-codes';
import { ObjectId } from 'mongodb';
import { User } from '../models/user/doc';

export enum TokenType {
  API,
  PASSWORD,
  EMAIL,
  SHARE
}

export interface TokenData<T = any> {
  _id: string;
  type: TokenType;
  date: number;
  remember?: boolean;
  payload?: T;
}

export async function verifyToken(token: string, type: TokenType) {
  let tokenData: TokenData;
  let userId: ObjectId;
  let user: User | null;

  if (!token)
    throw new HttpError(HttpCode.TOKEN_REQUIRED, "unauthorized");

  try {
    tokenData = verify(token, config.tokenSecret) as TokenData;
  } catch (error: any) {
    throw new HttpError(HttpCode.INVALID_TOKEN, "invalidToken");
  }

  if (!tokenData._id)
    throw new HttpError(HttpCode.INVALID_TOKEN, "invalidTokenData");

  if (tokenData.type !== type)
    throw new HttpError(HttpCode.INVALID_TOKEN, "invalidTokenType");

  try {
    userId = new ObjectId(tokenData._id);
  } catch (error: any) {
    throw new HttpError(HttpCode.INVALID_TOKEN, "invalidTokenId");
  }

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
      await authModel.removeSession(userId, token);
      throw new HttpError(HttpCode.INVALID_TOKEN, "tokenExpired");
    }

  } else if (tokenData.type === TokenType.EMAIL) {
    if (Date.now() - tokenData.date > config.emailTokenExpiry)
      throw new HttpError(HttpCode.INVALID_TOKEN, "tokenExpired");

  } else if (tokenData.type === TokenType.PASSWORD) {
    if (Date.now() - tokenData.date > config.passwordTokenExpiry)
      throw new HttpError(HttpCode.INVALID_TOKEN, "tokenExpired");

  } else if (tokenData.type === TokenType.SHARE) {
    // TODO
  }

  user = await usersModel.get(userId, { active: 1, email: 1, roles: 1, groups: 1, username: 1, organization: 1 });

  if (!user)
    throw new HttpError(HttpCode.UNAUTHORIZED, "userNotFound");

  return { user, tokenData };
}