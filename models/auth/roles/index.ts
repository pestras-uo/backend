import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { Role } from "./interface";

export default {

  async get(id: number) {
    return (await oracle.op().query<Role>(`

      SELECT id "id", name "name"
      FROM ${TablesNames.ROLES}
      WHERE id = :id

    `, [id])).rows?.[0] || null;
  },

  async getAll() {
    return (await oracle.op().query<Role>(`

      SELECT id "id", name "name"
      FROM ${TablesNames.ROLES}

    `)).rows || [];
  }
}