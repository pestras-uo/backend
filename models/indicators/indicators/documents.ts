import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { exists } from "./util";
import { IndicatorDocument } from "./interface";

export async function getDocuments(indicator_id: string) {
  return (await oracle.op().query<IndicatorDocument>(`
  
    SELECT *
    FROM ${TablesNames.INDICATOR_DOCUMENT}
    WHERE ID.INDICATOR_ID = :a
  
  `, [indicator_id])).rows || [];
}

export async function addDocument(ind_id: string, path: string, name_ar: string, name_en: string) {
  if (!(await exists(ind_id)))
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorNotFound');

  await oracle.op()
    .write(`
    
      INSERT INTO ${TablesNames.INDICATOR_DOCUMENT} (indicator_id, path, name_ar, name_en)
      SET (:a, :b, :c, :d)
    
    `, [ind_id, path, name_ar, name_en])
    .commit();

  return true;
}

export async function deleteDocument(path: string) {
  await oracle.op()
    .write(`
    
      DELETE FROM ${TablesNames.INDICATOR_DOCUMENT}
      WHERE path = :a
    
    `, [path])
    .commit();

  return true;
}