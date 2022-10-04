import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { Group } from "./interface";
import { randomUUID } from 'crypto';
import { TablesNames } from "../..";
import serial from "util/serial";

export default {

  // getters
  // ----------------------------------------------------------------------------------------------------------------
  async get(id: string) {
    return (await oracle.op().query<Group>(`

      SELECT id 'id', name_ar 'name_ar', name_en 'name_en'
      FROM ${TablesNames.GROUPS}
      WHERE id = :id

    `, [id])).rows?.[0] || null;
  },

  async getAll() {
    return (await oracle.op().query<Group>(`

      SELECT id 'id', name_ar 'name_ar', name_en 'name_en'
      FROM ${TablesNames.GROUPS}

    `)).rows || [];
  },





  // util
  // ----------------------------------------------------------------------------------------------------------------
  async exists(id: string) {
    return (await oracle.op().query<{ count: number }>(`
    
      SELECT COUNT(*) as 'count'
      FROM ${TablesNames.GROUPS}
      WHERE id = :a
    
    `, [id])).rows?.[0].count! > 0;
  },

  async idsExists(ids: string[]) {
    const cs_id = ids.reduce((str: string, id: string) => str ? `${str}, ${id}` : str, '');
    return (await oracle.op().query<{ count: number }>(`
    
      SELECT COUNT(*) as 'count'
      FROM ${TablesNames.GROUPS}
      WHERE id IN :a
    
    `, [cs_id])).rows?.[0].count === ids.length;
  },





  // create
  // ----------------------------------------------------------------------------------------------------------------
  async create(name_ar: string, name_en: string) {
    const id = randomUUID();

    await oracle.op()
      .write(`
    
        INSERT INTO ${TablesNames.GROUPS} (id, name_ar, name_en)
        VALUES (:a, :b, :c)

      `, [id, name_ar, name_en])
      .commit();

    return { id: id, name_ar: name_ar, name_en: name_en } as Group;
  },





  // update
  // ----------------------------------------------------------------------------------------------------------------
  async update(id: string, name_ar: string, name_en: string) {
    if (!(await this.exists(id)))
      throw new HttpError(HttpCode.NOT_FOUND, "groupNotFound");

    await oracle.op()
      .write(`
    
        UPDATE ${TablesNames.GROUPS}
        SET name_ar = :a, name_en = :b
        WHERE id = :c

      `, [name_ar, name_en, id])
      .commit();

    return true;
  }
}