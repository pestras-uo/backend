import { Auth } from "./interface";
import oracle from '../../../db/oracle';

const TABLE_NAME = "auth";

export default {

  async getPassword(user_id: number) {
    return (await oracle.exec<Auth>(`

      SELECT * password, salt
      FROM ${TABLE_NAME}
      WHERE id = :id

    `, [user_id])).rows?.[0] || null;
  },

  async getSession(user_id: number) {
    return (await oracle.exec<Pick<Auth, 'SOCKET' | 'TOKEN'>>(`

      SELECT * token, socket
      FROM ${TABLE_NAME}
      WHERE id = :id

    `, [user_id])).rows?.[0] || null;
  },

  async hasSession(user_id: number, token: string) {
    return (await oracle.exec<{ COUNT: number }>(`

      SELECT COUNT(*) as COUNT
      FROM ${TABLE_NAME}
      WHERE id = :a AND token = :b

    `, [user_id, token])).rows?.[0].COUNT! > 0;
  },

  async create(user_id: number, password: string, salt: string) {
    await oracle.exec(`

      INSERT INTO ${TABLE_NAME} (user_id, password, salt)
      VALUES (:a, :b, :c)

    `, [user_id, password, salt]);

    return true;
  },

  async setToken(user_id: number, token: string) {
    await oracle.exec(`

      UPDATE ${TABLE_NAME}
      SET token = :token
      WHERE user_id = :id

    `, [token, user_id]);

    return true;
  },

  async setSocket(user_id: number, socket: string) {
    await oracle.exec(`

      UPDATE ${TABLE_NAME}
      SET socket = :socket
      WHERE user_id = :id

  `, [socket, user_id]);

    return true;
  },

  async updatePassword(user_id: number, password: string, salt: string) {
    await oracle.exec(`

      UPDATE ${TABLE_NAME}
      SET password = :a, salt = :b, update_date = :c
      WHERE user_id = :d

    `, [ user_id, password, salt, new Date() ]);

    return true;
  },

  async endSession(user_id: number) {
    await oracle.exec(`

      UPDATE ${TABLE_NAME}
      SET token = NULL, socket = NULL
      WHERE user_id = :id

    `, [user_id]);

    return true;
  },

  async removeSocket(user_id: number) {
    await oracle.exec(`

      UPDATE ${TABLE_NAME}
      SET socket = NULL
      WHERE user_id = :id

    `, [user_id]);

    return true;
  }
}