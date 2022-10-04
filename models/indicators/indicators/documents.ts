import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { exists } from "./util";
import { IndicatorDocument } from "./interface";

export async function getDocuments(indicator_id: string) {
  return (await oracle.op().query<IndicatorDocument>(`
  
    SELECT 
      indicator_id 'indicator_id',
      path 'path',
      name_ar 'name_ar',
      name_en 'name_en',
      upload_date 'upload_date',
    FROM ${TablesNames.IND_DOC}
    WHERE ID.INDICATOR_ID = :a
  
  `, [indicator_id])).rows || [];
}

export async function addDocument(ind_id: string, path: string, name_ar: string, name_en: string) {
  if (!(await exists(ind_id)))
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorNotFound');

  await oracle.op()
    .write(`
    
      INSERT INTO ${TablesNames.IND_DOC} (indicator_id, path, name_ar, name_en)
      SET (:a, :b, :c, :d)
    
    `, [ind_id, path, name_ar, name_en])
    .commit();

  return true;
}

export async function deleteDocument(path: string) {
  await oracle.op()
    .write(`
    
      DELETE FROM ${TablesNames.IND_DOC}
      WHERE path = :a
    
    `, [path])
    .commit();

  return true;
}