import { getByRowId } from '../..';
import oracle from '../../../db/oracle';
import { Document } from "./interface";

const TABLE_NAME = 'documents';
type documentEntityType = 'topic' | 'indicator' | 'reading';

export default {


  // get methods
  // ----------------------------------------------------------------------------------------------------------------
  async get(id: number) {
    const result = await oracle.exec<Document>(`
      SELECT *
      FROM ${TABLE_NAME}
      WHERE id = :id
    `, [id]);

    return result.rows?.[0] || null;
  },




  // create methods
  // ----------------------------------------------------------------------------------------------------------------

  async create(doc: Document, entity_id: number, entityType: documentEntityType) {
    const result = await oracle.exec(`
      INSERT INTO documnets (path, mime_type, name_ar, name_en, desc_ar, desc_en)
      VALUES (:a, :b, :c, :d, :e, :f)
    `, [
      doc.PATH,
      doc.MIME_TYPE,
      doc.NAME_AR,
      doc.NAME_EN,
      doc.DESC_AR,
      doc.DESC_EN
    ]);

    const d = await getByRowId<Document>(TABLE_NAME, result.lastRowid!);

    await oracle.exec(`
    
      INSERT INTO ${entityType}_document (document_id, ${entityType}_id)
      VALUES(:a, :b)
    
    `, [d!.ID, entity_id]);

    return d;
  },




  // delete methods
  // ----------------------------------------------------------------------------------------------------------------
  async delete(id: number) {
    await oracle.exec(`
      DELETE FROM ${TABLE_NAME}
      WHERE id = :id
    `, [id]);

    return true;
  }
}