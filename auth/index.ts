import { HttpError } from "../misc/errors";
import { HttpCode } from "../misc/http-codes";
import { TokenMeta, TokenType, verify } from "./token";

import authModel from '../models/auth/auth';
import { User } from "../models/auth/user/interface";
import { Action } from "./roles/actions";
import { Group } from "../models/auth/groups/interface";
import { cache } from "../cache";
import { authorize } from "./roles/manager";

export interface UserSession {
  groups: Group[],
  action: Action,
  user: User;
  session: {
    TOKEN: string,
    TOKEN_CREATE_DATE: Date,
    TOKEN_EXP_DATE: Date
  }
}

export async function authenticate(
  token: string,
  type: TokenType,
  action?: Action,
  entity_id?: string,
  payload?: { [key: string]: any }
) {
  const tokenData = verify(token);

  if (tokenData.type !== type)
    throw new HttpError(HttpCode.INVALID_TOKEN, "invalidTokenType");

  // TODO: validate api token
  // if (tokenData.type === TokenType.API)
  //   return validateApiAccess(tokenData.id);

  const session = await validateSessionToken(tokenData.id, token);
  const user = cache.users.get(tokenData.id);

  if (!user)
    throw new HttpError(HttpCode.UNAUTHORIZED, "tokenExpired");

  if (!user.is_active)
    throw new HttpError(HttpCode.UNAUTHORIZED, 'userIsInactive');

  if (action && !authorize(action, user, entity_id, payload))
    throw new HttpError(HttpCode.UNAUTHORIZED, "unauthorizedRole");

  return {
    user,
    session: {
      TOKEN: token,
      TOKEN_CREATE_DATE: session.token_create_date,
      TOKEN_EXP_DATE: session.token_exp_date
    } as TokenMeta
  };
}

// validate session
// ----------------------------------------------------------------------------------------------------------
async function validateSessionToken(user_id: string, token: string) {
  const session = await authModel.getSessionByToken(user_id, token);

  if (!session)
    throw new HttpError(HttpCode.INVALID_TOKEN, "tokenExpired");

  if (session.token_exp_date?.getTime()! < Date.now()) {
    console.log('expired');
    await authModel.endSession(user_id);
    throw new HttpError(HttpCode.INVALID_TOKEN, "tokenExpired");
  }

  return {
    token_create_date: session.token_create_date,
    token_exp_date: session.token_exp_date
  }
}




// validate api access
// ----------------------------------------------------------------------------------------------------------
async function validateApiAccess(api_id: string) {
  throw new HttpError(HttpCode.SERVIC_UNAVAILABLE, "serviceUnavailable");
}