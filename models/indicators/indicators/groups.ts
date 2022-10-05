import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { exists } from "./util";

export async function getGroups(indicator_id: string) {
  return ((await oracle.op().query<{ group_id: string }>(`
  
    SELECT group_id 'group_id'
    FROM ${TablesNames.IND_GROUP}
    WHERE indicator_id = :a
  
  `, [indicator_id])).rows || []).map(r => r.group_id);
}

export async function replaceGroups(id: string, groups: string[]) {
  if (!(await exists(id)))
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorNotFound');

  await oracle.op()
    .write(`
    
      DELETE FROM ${TablesNames.IND_GROUP}
      WHERE indicator_id = :a

    `, [id])
    .writeMany(`
    
      INSERT INTO ${TablesNames.IND_GROUP} (indicator_id, group_id)
      VALUES (:a, :b)
    
    `, groups.map(g => [id, g]))
    .commit();

  return true;
}