import oracle from "../../../db/oracle";
import { Role } from "./interface";

const TABLE_NAME = 'roles';

export default {

  async get(id: number) {
    return (await oracle.exec<Role>(`

      SELECT *
      FROM ${TABLE_NAME}
      WHERE id = :id

    `, [id])).rows?.[0] || null;
  },

  async getAll() {
    return (await oracle.exec<Role>(`

      SELECT * 
      FROM ${TABLE_NAME}

    `)).rows || [];
  }
}