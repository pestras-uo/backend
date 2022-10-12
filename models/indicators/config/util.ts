import oracle from "../../../db/oracle";
import { TablesNames } from "../../";
import { ColumnType, IndicatorType, ReadingColumn } from "./interface";

export async function exists(indicator_id: string) {
  return (await oracle.op().query<{ count: number }>(`
  
  SELECT COUNT(*) AS "count"
  FROM ${TablesNames.IND_CONF}
  WHERE indicator_id = :a

`, [indicator_id])).rows?.[0].count! > 0;
}

export async function existsMany(ids: string[]) {
  return (await oracle.op().query<{ count: number }>(`

     SELECT COUNT(id) as "count"
     FROM ${TablesNames.IND_CONF}
     WHERE indicator_id IN :a

   `, [ids])).rows?.[0].count === ids.length;
}