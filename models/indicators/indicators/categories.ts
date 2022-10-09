import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { exists } from "./util";

export async function updateCategories(id: string, categories: string[], issuer_id: string) {
  if (!(await exists(id)))
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorNotFound');

  const date = new Date();

  await oracle.op()
    .write(`
    
      UPDATE ${TablesNames.INDICATORS}
      SET categories = :a, update_date = :b, update_by = :c
      WHERE id = :d
    
    `, [JSON.stringify(categories), date, issuer_id, id])
    .commit();

  return true;
}