import oracle, { DBSchemas } from "../../../db/oracle";

export async function exists(
  indicator_id: string,
  id: string
) {
  return (await oracle.op(DBSchemas.READINGS).query<{ count: number }>(`
  
    SELECT COUNT(*) 'count'
    FROM ${indicator_id}
    WHERE id = :a
  
  `, [id])).rows?.[0].count! > 0;
}