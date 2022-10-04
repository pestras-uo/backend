import oracle from "db/oracle";
import { TablesNames } from "models";
import { ReadingColumn } from "./interface";

export async function getAdditionalColumns(indicator_id: string) {
  return (await oracle.op().query<ReadingColumn>(`
  
    SELECT 
      id 'id',
      indicator_id 'indicator_id',
      column_name 'column_name',
      type 'type',
      name_ar 'name_ar',
      name_en 'name_en'
    FROM ${TablesNames.READ_ADD_COLS}
    WHERE indicator_id = :a

  `, [indicator_id])).rows || [];
}

export async function exists(indicator_id: string) {
  return (await oracle.op().query<{ count: number }>(`
  
  SELECT COUNT(*) AS 'count'
  FROM ${TablesNames.IND_CONF}
  WHERE indicator_id = :a

`, [indicator_id])).rows?.[0].count! > 0;
}