import { Auth } from "./interface";
import oracle from '../../../db/oracle';
import { TablesNames } from "../..";
import crypt from "../../../auth/crypt";
import { HttpCode } from "../../../misc/http-codes";
import { HttpError } from "../../../misc/errors";

export default {


  // getters
  // ----------------------------------------------------------------------------------------------------------------
  async getPassword(user_id: string) {
    return (await oracle.op().read<Auth>(`

      SELECT password, salt
      FROM ${TablesNames.AUTH}
      WHERE user_id = :a

    `, [user_id])).rows?.[0] || null;
  },

  async getSession(user_id: string) {
    return (await oracle.op().read<Pick<Auth, 'SOCKET' | 'TOKEN' | 'TOKEN_CREATE_DATE' | 'TOKEN_EXP_DATE'>>(`

      SELECT token, token_create_date, token_exp_date socket
      FROM ${TablesNames.AUTH}
      WHERE user_id = :a

    `, [user_id])).rows?.[0] || null;
  },

  async getSessionByToken(user_id: string, token: string) {
    return (await oracle.op().read<Pick<Auth, 'SOCKET' | 'TOKEN' | 'TOKEN_CREATE_DATE' | 'TOKEN_EXP_DATE'>>(`

      SELECT token, token_create_date, token_exp_date, socket
      FROM ${TablesNames.AUTH}
      WHERE user_id = :a AND token = :b

    `, [user_id, token])).rows?.[0] || null;
  },




  // util
  // ----------------------------------------------------------------------------------------------------------------
  async exists(user_id: string) {
    return (await oracle.op().read<{ COUNT: number }>(`

      SELECT COUNT(*) as COUNT
      FROM ${TablesNames.AUTH}
      WHERE user_id = :a

    `, [user_id])).rows?.[0].COUNT! > 0;
  },

  async hasSession(user_id: string, token: string) {
    return (await oracle.op().read<{ COUNT: number }>(`

      SELECT COUNT(*) as COUNT
      FROM ${TablesNames.AUTH}
      WHERE user_id = :a AND token = :b

    `, [user_id, token])).rows?.[0].COUNT! > 0;
  },




  // update session
  // ----------------------------------------------------------------------------------------------------------------
  async setToken(user_id: string, token: string, expAfter: number) {
    const create_date = new Date();
    const exp_date = new Date(create_date.getTime() + expAfter);

    if (!(await this.exists(user_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'userAuthNotFound');

    await oracle.op()
      .write(`

        UPDATE ${TablesNames.AUTH}
        SET token = :a, token_create_date = :b, token_exp_date = :c
        WHERE user_id = :d

      `, [token, create_date, exp_date, user_id])
      .commit();

    return true;
  },

  async setSocket(user_id: string, socket: string) {
    if (!(await this.exists(user_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'userAuthNotFound');

    await oracle.op()
      .write(`

        UPDATE ${TablesNames.AUTH}
        SET socket = :socket
        WHERE user_id = :id

    `, [socket, user_id])
      .commit();

    return true;
  },

  async endSession(user_id: string) {
    if (!(await this.exists(user_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'userAuthNotFound');

    await oracle.op()
      .write(`

        UPDATE ${TablesNames.AUTH}
        SET token = :a, token_create_date = :b, token_exp_date = :c, socket = :d
        WHERE user_id = :e

      `, [null, null, null, null, user_id])
      .commit();

    return true;
  },

  async removeSocket(user_id: string) {
    if (!(await this.exists(user_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'userAuthNotFound');

    await oracle.op()
      .write(`

        UPDATE ${TablesNames.AUTH}
        SET socket = :a
        WHERE user_id = :b

      `, [null, user_id])
      .commit();

    return true;
  },




  // update password
  // ----------------------------------------------------------------------------------------------------------------
  async updatePassword(user_id: string, password: string) {
    if (!(await this.exists(user_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'userAuthNotFound');

    const [hashed, salt] = await crypt.hash(password);

    await oracle.op()
      .write(`

        UPDATE ${TablesNames.AUTH}
        SET password = :a, salt = :b, update_date = :c
        WHERE user_id = :d

      `, [hashed, salt, new Date(), user_id])
      .commit();

    return true;
  }
}