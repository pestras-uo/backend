import { TablesNames } from "../..";
import oracle from "../../../db/oracle";

export async function exists(id: string) {
  return (await oracle.op().query<{ count: number }>(`

     SELECT COUNT(id) as 'count'
     FROM ${TablesNames.INDICATORS}
     WHERE id = :id

   `, [id])).rows?.[0].count! > 0;
}

export async function existsMany(ids: string[]) {
  return (await oracle.op().query<{ count: number }>(`

     SELECT COUNT(id) as 'count'
     FROM ${TablesNames.INDICATORS}
     WHERE id IN :id

   `, [ids])).rows?.[0].count === ids.length;
}