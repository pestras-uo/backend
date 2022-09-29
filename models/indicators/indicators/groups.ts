import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { Group } from "../../auth/groups/interface";
import { exists } from "./util";

export async function getGroups(indicator_id: string) {
  return (await oracle.op().query<Group>(`
  
    SELECT G.*
    FROM ${TablesNames.GROUPS} G, ${TablesNames.INDICATOR_GROUP} IG
    WHERE IG.INDICATOR_ID = :a AND G.ID = IG.GROUP_ID
  
  `, [indicator_id])).rows || [];
}

export async function replaceGroups(id: string, groups: string[]) {
  if (!(await exists(id)))
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorNotFound');

  await oracle.op()
    .write(`
    
      DELETE FROM ${TablesNames.INDICATOR_GROUP}
      WHERE indicator_id = :a

    `, [id])
    .writeMany(`
    
      INSERT INTO ${TablesNames.INDICATOR_GROUP} (indicator_id, group_id)
      VALUES (:a, :b)
    
    `, groups.map(g => [id, g]))
    .commit();

  return true;
}