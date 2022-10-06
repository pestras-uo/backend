import oracle, { DBSchemas } from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { TablesNames } from "../../";
import { ReadingDocument } from "./interface";
import { exists } from "./util";

export async function getDocuments(
  indicator_id: string, 
  id: string
) {
  return (await oracle.op(DBSchemas.READINGS).query<ReadingDocument>(`
  
    SELECT 
      indicator_id "indicator_id",
      reading_id "reading_id",
      path "path",
      name_ar "name_ar",
      name_en "name_en",
      upload_date "upload_date"
    FROM ${TablesNames.READ_DOC}
    WHERE indicator_id = :a AND reading_id = :b
  
  `, [indicator_id, id])).rows || [];
}

export async function addDocument(
  indicator_id: string, 
  id: string, 
  path: string, 
  name_ar: string, 
  name_en: string
) {
  if (!(await exists(indicator_id, id)))
    throw new HttpError(HttpCode.NOT_FOUND, 'readingNotFound');

  await oracle.op(DBSchemas.READINGS)
    .write(`
    
      INSERT INTO ${TablesNames.READ_DOC} (indicator_id, reading_id, path, name_ar, name_en)
      SET (:a, :b, :c, :d, :e)
    
    `, [indicator_id, id, path, name_ar, name_en])
    .commit();

  return true;
}

export async function deleteDocument(path: string) {
  await oracle.op(DBSchemas.READINGS)
    .write(`
    
      DELETE FROM ${TablesNames.READ_DOC}
      WHERE path = :a
    
    `, [path])
    .commit();

  return true;
}