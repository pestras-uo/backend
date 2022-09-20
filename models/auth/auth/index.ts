import { Auth } from "./interface";
import oracle from '../../../db/oracle';
import { TablesNames } from "../..";

export default {
  

  // getters
  // ----------------------------------------------------------------------------------------------------------------
  async getPassword(user_id: string) {
    return (await oracle.exec<Auth>(`

      SELECT password, salt
      FROM ${TablesNames.AUTH}
      WHERE user_id = :a

    `, [user_id])).rows?.[0] || null;
  },

  async getSession(user_id: string) {
    return (await oracle.exec<Pick<Auth, 'SOCKET' | 'TOKEN' | 'TOKEN_CREATE_DATE' | 'TOKEN_EXP_DATE'>>(`

      SELECT token, token_create_date, token_exp_date socket
      FROM ${TablesNames.AUTH}
      WHERE user_id = :a

    `, [user_id])).rows?.[0] || null;
  },

  async getSessionByToken(user_id: string, token: string) {
    return (await oracle.exec<Pick<Auth, 'SOCKET' | 'TOKEN' | 'TOKEN_CREATE_DATE' | 'TOKEN_EXP_DATE'>>(`

      SELECT token, token_create_date, token_exp_date, socket
      FROM ${TablesNames.AUTH}
      WHERE user_id = :a AND token = :b

    `, [user_id, token])).rows?.[0] || null;
  },




  // util
  // ----------------------------------------------------------------------------------------------------------------
  async hasSession(user_id: string, token: string) {
    return (await oracle.exec<{ COUNT: number }>(`

      SELECT COUNT(*) as COUNT
      FROM ${TablesNames.AUTH}
      WHERE user_id = :a AND token = :b

    `, [user_id, token])).rows?.[0].COUNT! > 0;
  },


  

  // create
  // ----------------------------------------------------------------------------------------------------------------
  async create(user_id: string, password: string, salt: string) {
    await oracle.exec(`

      INSERT INTO ${TablesNames.AUTH} (user_id, password, salt)
      VALUES (:a, :b, :c)

    `, [user_id, password, salt]);

    return true;
  },



  
  // update session
  // ----------------------------------------------------------------------------------------------------------------
  async setToken(user_id: string, token: string, expAfter: number) {
    const create_date = new Date();
    const exp_date = new Date(create_date.getTime() + expAfter);

    await oracle.exec(`

      UPDATE ${TablesNames.AUTH}
      SET token = :a, token_create_date = :b, token_exp_date = :c
      WHERE user_id = :d

    `, [token, create_date, exp_date, user_id]);

    return true;
  },

  async setSocket(user_id: string, socket: string) {
    await oracle.exec(`

      UPDATE ${TablesNames.AUTH}
      SET socket = :socket
      WHERE user_id = :id

  `, [socket, user_id]);

    return true;
  },

  async endSession(user_id: string) {
    await oracle.exec(`

      UPDATE ${TablesNames.AUTH}
      SET token = :a, token_create_date = :b, token_exp_date = :c, socket = :d
      WHERE user_id = :e

    `, [null, null, null, null, user_id]);

    return true;
  },

  async removeSocket(user_id: string) {
    await oracle.exec(`

      UPDATE ${TablesNames.AUTH}
      SET socket = :a
      WHERE user_id = :b

    `, [null, user_id]);

    return true;
  },


  

  // update password
  // ----------------------------------------------------------------------------------------------------------------
  async updatePassword(user_id: string, password: string, salt: string) {
    await oracle.exec(`

      UPDATE ${TablesNames.AUTH}
      SET password = :a, salt = :b, update_date = :c
      WHERE user_id = :d

    `, [ password, salt, new Date(), user_id ]);

    return true;
  }
}