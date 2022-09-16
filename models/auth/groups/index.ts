import { getByRowId } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { Group } from "./interface";

const TABLE_NAME = 'groups';

export default {

  async get(id: number) {
    return (await oracle.exec<Group>(`

      SELECT *
      FROM ${TABLE_NAME}
      WHERE id = :id

    `, [id])).rows?.[0] || null;
  },

  async getAll() {
    return (await oracle.exec<Group>(`

      SELECT * 
      FROM ${TABLE_NAME}

    `)).rows || [];
  },

  async nameExists(name: string) {
    return (await oracle.exec<{ count: number }>(`
    
      SELECT COUNT(id) as count
      FROM ${TABLE_NAME}
      WHERE name = :name
    
    `, [name])).rows?.[0].count! > 0;
  },

  async create(name: string) {
    if (await this.nameExists(name))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const result = await oracle.exec(`
    
      INSERT INTO ${TABLE_NAME} (name)
      VALUES (:name)

    `, [name]);

    return getByRowId(TABLE_NAME, result.lastRowid!);
  },

  async update(id: number, name: string) {
    if (await this.nameExists(name))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET name = :name

    `, [name]);

    return true;
  }
}