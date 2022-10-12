import oracle, { DBSchemas } from "../../../db/oracle";
import { ColumnType } from "../config/interface";
import { get } from "../config/read";

export async function exists(
  indicator_id: string,
  id: string
) {
  const config = await get(indicator_id);

  if (!config)
    return false;

  const idCol = config.columns.find(c => c.type === ColumnType.ID).name;

  return (await oracle.op(DBSchemas.READINGS).query<{ count: number }>(`
  
    SELECT COUNT(*) "count"
    FROM ${config.source_name}
    WHERE ${idCol} = :a
  
  `, [id])).rows?.[0].count! > 0;
}