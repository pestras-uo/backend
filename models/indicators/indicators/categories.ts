import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { Category } from "../../misc/categories/interface";
import { exists } from "./util";

export async function getCategories(indicator_id: string) {
  return (await oracle.op().read<Category>(`
  
    SELECT C.*
    FROM ${TablesNames.CATEGORIES} C, ${TablesNames.INDICATOR_CATEGORY} IC
    WHERE IC.INDICATOR_ID = :a AND C.ID = IC.CATEGORY_ID
  
  `, [indicator_id])).rows || [];
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