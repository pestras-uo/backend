import { Auth } from "./interface";
import oracle from '../../../db/oracle';
import { TablesNames } from "../..";

export default {
  

  // getters
  // ----------------------------------------------------------------------------------------------------------------
  async getPassword(user_id: string) {
    return (await oracle.exec<Auth>(`

      SELECT * password, salt
      FROM ${TablesNames.AUTH}
      WHERE id = :id

    `, [user_id])).rows?.[0] || null;
  },

  async getSession(user_id: string) {
    return (await oracle.exec<Pick<Auth, 'SOCKET' | 'TOKEN'>>(`

      SELECT * token, socket
      FROM ${TablesNames.AUTH}
      WHERE id = :id

    `, [user_id])).rows?.[0] || null;
  },




  // util
  // ----------------------------------------------------------------------------------------------------------------
  async hasSession(user_id: string, token: string) {
    return (await oracle.exec<{ COUNT: number }>(`

      SELECT COUNT(*) as COUNT
      FROM ${TablesNames.AUTH}
      WHERE id = :a AND token = :b

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
  async setToken(user_id: string, token: string) {
    await oracle.exec(`

      UPDATE ${TablesNames.AUTH}
      SET token = :token
      WHERE user_id = :id

    `, [token, user_id]);

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
      SET token = NULL, socket = NULL
      WHERE user_id = :id

    `, [user_id]);

    return true;
  },

  async removeSocket(user_id: string) {
    await oracle.exec(`

      UPDATE ${TablesNames.AUTH}
      SET socket = NULL
      WHERE user_id = :id

    `, [user_id]);

    return true;
  },


  

  // update password
  // ----------------------------------------------------------------------------------------------------------------
  async updatePassword(user_id: string, password: string, salt: string) {
    await oracle.exec(`

      UPDATE ${TablesNames.AUTH}
      SET password = :a, salt = :b, update_date = :c
      WHERE user_id = :d

    `, [ user_id, password, salt, new Date() ]);

    return true;
  }
}