import config from '../config';
import jwt from 'jsonwebtoken';

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

export interface TokenData {
  id: string;
  type: TokenType;
}

export function sign(data: TokenData) {
  return jwt.sign(data, config.tokenSecret);
}

export function verify(token: string) {
  let tokenData: TokenData;

  if (!token)
    throw new HttpError(HttpCode.TOKEN_REQUIRED, "tokenRequired");

  try {
    tokenData = jwt.verify(token, config.tokenSecret) as TokenData;
  } catch (error: any) {
    throw new HttpError(HttpCode.INVALID_TOKEN, "invalidToken");
  }

  if (tokenData.type === TokenType.SESSION) {
    if (!tokenData.id)
      throw new HttpError(HttpCode.INVALID_TOKEN, "invalidTokenData");
  }

  return tokenData;
}

