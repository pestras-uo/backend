import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { exists } from "./util";

export async function getCategories(indicator_id: string) {
  return ((await oracle.op().query<{ CATEGORY_ID: string }>(`
  
    SELECT category_id
    FROM ${TablesNames.INDICATOR_CATEGORY}
    WHERE indicator_id = :a
  
  `, [indicator_id])).rows || []).map(r => r.CATEGORY_ID);
}

export async function replaceCategories(id: string, categories: string[]) {
  if (!(await exists(id)))
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorNotFound');

  await oracle.op()
    .write(`
    
      DELETE FROM ${TablesNames.INDICATOR_CATEGORY}
      WHERE indicator_id = :a
    
    `, [id])
    .writeMany(`
    
      INSERT INTO ${TablesNames.INDICATOR_CATEGORY} (indicator_id, category_id)
      VALUES (:a, :b)
    
    `, categories.map(c => [id, c]))
    .commit();

  return true;
}