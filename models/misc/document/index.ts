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

  async create(doc: Document) {
    const id = randomUUID();
    const result = await oracle.exec(`
      INSERT INTO documnets (id, path, mime_type, name_ar, name_en, desc_ar, desc_en)
      VALUES (:a, :b, :c, :d, :e, :f, :g)
    `, [
      id,
      doc.PATH,
      doc.MIME_TYPE,
      doc.NAME_AR,
      doc.NAME_EN,
      doc.DESC_AR,
      doc.DESC_EN
    ]);

    const d = await getByRowId<Document>(TablesNames.DOCUMENTS, result.lastRowid!);

    return d;
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