import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { exists } from "./util";

export async function getCategories(indicator_id: string) {
  return ((await oracle.op().query<{ category_id: string }>(`
  
    SELECT category_id "category_id"
    FROM ${TablesNames.IND_CAT}
    WHERE indicator_id = :a
  
  `, [indicator_id])).rows || []).map(r => r.category_id);
}

export async function replaceCategories(id: string, categories: string[]) {
  if (!(await exists(id)))
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorNotFound');

  await oracle.op()
    .write(`
    
      DELETE FROM ${TablesNames.IND_CAT}
      WHERE indicator_id = :a
    
    `, [id])
    .writeMany(`
    
      INSERT INTO ${TablesNames.IND_CAT} (indicator_id, category_id)
      VALUES (:a, :b)
    
    `, categories.map(c => [id, c]))
    .commit();

  return true;
}