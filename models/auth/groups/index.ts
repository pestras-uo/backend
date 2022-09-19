import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { Group } from "./interface";
import { randomUUID } from 'crypto';
import { TablesNames } from "../..";

export default {

  // getters
  // ----------------------------------------------------------------------------------------------------------------
  async get(id: string) {
    return (await oracle.exec<Group>(`

      SELECT *
      FROM ${TablesNames.GROUPS}
      WHERE id = :id

    `, [id])).rows?.[0] || null;
  },

  async getAll() {
    return (await oracle.exec<Group>(`

      SELECT * 
      FROM ${TablesNames.GROUPS}

    `)).rows || [];
  },





  // util
  // ----------------------------------------------------------------------------------------------------------------
  async nameExists(name: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(id) as count
      FROM ${TablesNames.GROUPS}
      WHERE name = :a
    
    `, [name])).rows?.[0].COUNT! > 0;
  },

  async idExists(id: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*) as COUNT
      FROM ${TablesNames.GROUPS}
      WHERE id = :a
    
    `, [id])).rows?.[0].COUNT! > 0;
  },

  async idsExists(ids: string[]) {
    const cs_id = ids.reduce((str: string, id: string) => str ? `${str}, ${id}` : str, '');
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*) as COUNT
      FROM ${TablesNames.GROUPS}
      WHERE id IN :a
    
    `, [cs_id])).rows?.[0].COUNT === ids.length;
  },





  // create
  // ----------------------------------------------------------------------------------------------------------------
  async create(NAME: string) {
    if (await this.nameExists(NAME))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const ID = randomUUID();

    await oracle.exec(`
    
      INSERT INTO ${TablesNames.GROUPS} (id, name)
      VALUES (:a, :b)

    `, [ID, NAME]);

    return { ID, NAME } as Group;
  },





  // update
  // ----------------------------------------------------------------------------------------------------------------
  async update(id: string, name: string) {
    if (await this.nameExists(name))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    await oracle.exec(`
    
      UPDATE ${TablesNames.GROUPS}
      SET name = :a
      WHERE id = :b

    `, [name, id]);

    return true;
  }
}