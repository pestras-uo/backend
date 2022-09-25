import { TablesNames } from "../..";
import oracle, { DBSchemas } from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { District } from "./interface";
import { randomUUID } from 'crypto';

export default {

  // getters
  // ------------------------------------------------------------------------------------------------
  async getAll() {
    return (await oracle.op(DBSchemas.READINGS).read<District>(`
    
      SELECT *
      FROM ${TablesNames.DISTRICTS}
    
    `)).rows || [];
  },

  async get(id: string) {
    return (await oracle.op(DBSchemas.READINGS).read<District>(`
    
      SELECT *
      FROM ${TablesNames.DISTRICTS}
      WHERE id = :a
    
    `, [id])).rows?.[0] || null;
  },



  
  // util
  // ------------------------------------------------------------------------------------------------
  async nameExists(name_ar: string, name_en: string) {
    return (await oracle.op(DBSchemas.READINGS).read<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TablesNames.DISTRICTS}
      WHERE name_ar = :a, name_en = :b
    
    `, [name_ar, name_en])).rows?.[0].COUNT! > 0;
  },

  async updateNameExists(id: string, name_ar: string, name_en: string) {
    return (await oracle.op(DBSchemas.READINGS).read<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TablesNames.DISTRICTS}
      WHERE (name_ar = :a, name_en = :b) AND id = :c
    
    `, [name_ar, name_en, id])).rows?.[0].COUNT! > 0;
  },



  
  // create
  // ------------------------------------------------------------------------------------------------
  async create(name_ar: string, name_en: string) {
    if (await this.nameExists(name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, 'nameAlreadyExists');

    const id = randomUUID();

    await oracle.op(DBSchemas.READINGS)
      .write(`
      
        INSERT INTO ${TablesNames.DISTRICTS} (id, name_ar, name_en)
        VALUES (:a, :b, :c)

      `, [id, name_ar, name_en])
      .commit();

    return { ID: id, NAME_AR: name_ar, NAME_EN: name_en } as District;
  },



  
  // update
  // ------------------------------------------------------------------------------------------------
  async update(id: string, name_ar: string, name_en: string) {
    if (await this.updateNameExists(id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, 'nameAlreadyExists');

    await oracle.op(DBSchemas.READINGS)
      .write(`
      
        UPDATE ${TablesNames.DISTRICTS}
        SET name_ar = :a, name_en = :b
        WHERE id = :c
      
      `, [name_ar, name_en, id])
      .commit();

    return true;
  }
}