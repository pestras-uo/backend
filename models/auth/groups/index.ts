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
    return (await oracle.op().read<Group>(`

      SELECT *
      FROM ${TablesNames.GROUPS}
      WHERE id = :id

    `, [id])).rows?.[0] || null;
  },

  async getAll() {
    return (await oracle.op().read<Group>(`

      SELECT * 
      FROM ${TablesNames.GROUPS}

    `)).rows || [];
  },





  // util
  // ----------------------------------------------------------------------------------------------------------------
  async nameExists(name_ar: string, name_en: string) {
    return (await oracle.op().read<{ COUNT: number }>(`
    
      SELECT COUNT(id) as count
      FROM ${TablesNames.GROUPS}
      WHERE name_ar = :a OR name_en = :b 
    
    `, [name_ar, name_en])).rows?.[0].COUNT! > 0;
  },

  async updateNameExists(id: string, name_ar: string, name_en: string) {
    return (await oracle.op().read<{ COUNT: number }>(`
    
      SELECT COUNT(id) as count
      FROM ${TablesNames.GROUPS}
      WHERE (name_ar = :a OR name_en = :b) AND id <> :c
    
    `, [name_ar, name_en, id])).rows?.[0].COUNT! > 0;
  },

  async exists(id: string) {
    return (await oracle.op().read<{ COUNT: number }>(`
    
      SELECT COUNT(*) as COUNT
      FROM ${TablesNames.GROUPS}
      WHERE id = :a
    
    `, [id])).rows?.[0].COUNT! > 0;
  },

  async idsExists(ids: string[]) {
    const cs_id = ids.reduce((str: string, id: string) => str ? `${str}, ${id}` : str, '');
    return (await oracle.op().read<{ COUNT: number }>(`
    
      SELECT COUNT(*) as COUNT
      FROM ${TablesNames.GROUPS}
      WHERE id IN :a
    
    `, [cs_id])).rows?.[0].COUNT === ids.length;
  },





  // create
  // ----------------------------------------------------------------------------------------------------------------
  async create(name_ar: string, name_en: string) {
    if (await this.nameExists(name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const id = randomUUID();

    await oracle.op()
      .write(`
    
        INSERT INTO ${TablesNames.GROUPS} (id, name_ar, name_en)
        VALUES (:a, :b, :c)

      `, [id, name_ar, name_en])
      .commit();

    return { ID: id, NAME_AR: name_ar, NAME_EN: name_en } as Group;
  },





  // update
  // ----------------------------------------------------------------------------------------------------------------
  async update(id: string, name_ar: string, name_en: string) {
    if (!(await this.exists(id)))
      throw new HttpError(HttpCode.NOT_FOUND, "groupNotFound");

    if (await this.updateNameExists(id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

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