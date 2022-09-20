import { getByRowId, TablesNames } from '../..';
import oracle from '../../../db/oracle';
import { Document } from "./interface";
import { randomUUID } from 'crypto';

type documentEntityType = 'topic' | 'indicator' | 'reading';

export default {


  // get methods
  // ----------------------------------------------------------------------------------------------------------------
  async get(id: string) {
    const result = await oracle.exec<Document>(`
      SELECT *
      FROM ${TablesNames.DOCUMENTS}
      WHERE id = :id
    `, [id]);

    return result.rows?.[0] || null;
  },




  // create methods
  // ----------------------------------------------------------------------------------------------------------------

  async create(path: string, name_ar: string, name_en: string) {
    const id = randomUUID();
    
    await oracle.exec(`

      INSERT INTO ${TablesNames.DOCUMENTS} (id, path, name_ar, name_en)
      VALUES (:a, :b, :c, :d)

    `, [id, path, name_ar, name_en]);

    return id;
  },




  // delete methods
  // ----------------------------------------------------------------------------------------------------------------
  async delete(id: string) {
    await oracle.exec(`
      DELETE FROM ${TablesNames.DOCUMENTS}
      WHERE id = :id
    `, [id]);

    return true;
  }
}