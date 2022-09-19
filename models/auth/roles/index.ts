import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { Role } from "./interface";

export default {

  async get(id: number) {
    return (await oracle.exec<Role>(`

      SELECT *
      FROM ${TablesNames.ROLES}
      WHERE id = :id

    `, [id])).rows?.[0] || null;
  },

  async getAll() {
    return (await oracle.exec<Role>(`

      SELECT * 
      FROM ${TablesNames.ROLES}

    `)).rows || [];
  }
}