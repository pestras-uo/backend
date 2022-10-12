import oracle, { DBSchemas } from '../../../db/oracle';
import { HttpError } from '../../../misc/errors';
import { HttpCode } from '../../../misc/http-codes';
import { ColumnType, IndicatorType } from '../config/interface';
import { get as getConfig } from '../config/read';
import { ManualIndicatorReading } from './interface';
import { buildWhereClause } from '../util';

export async function get(
  indicator_id: string,
  offset = 0,
  limit = 100
) {
  const config = await getConfig(indicator_id);
  let columns = `${config.columns.map(c => `${c.name} "${c.name}"`).join(",")}`;
  let whereClause = '';

  if (config.filter_options)
    whereClause = `WHERE ${buildWhereClause(config.filter_options)}`;

  return (await oracle.op(DBSchemas.READINGS)
    .query<ManualIndicatorReading>(`
    
      SELECT
        ${columns}
      FROM 
        ${config.source_name}
      ${whereClause}
      OFFSET :b ROWS
      FETCH NEXT :c ROWS ONLY

    `, [offset, limit])).rows || [];
}


export async function getById(indicator_id: string, id: string) {
  const config = await getConfig(indicator_id);

  if (!config)
    throw new HttpError(HttpCode.NOT_FOUND, 'indicaotrConfigNotFound');

  if (config.type !== IndicatorType.MANUAL)
    return null;

  const columns = `${config.columns.map(c => `${c.name} "${c.name}"`).join(",")}`;
  const idColumn = config.columns.find(c => c.type === ColumnType.ID);

  return (await oracle.op(DBSchemas.READINGS)
    .query<ManualIndicatorReading>(`
    
      SELECT
        ${columns}
      FROM
        ${config.source_name}
      WHERE ${idColumn.name} = :a

    `, [id])).rows[0] || null;
}

export async function getHistory(indicator_id: string, id: string) {
  const config = await getConfig(indicator_id);

  if (!config)
    throw new HttpError(HttpCode.NOT_FOUND, 'indicaotrConfigNotFound');

  if (config.type !== IndicatorType.MANUAL)
    return [];

  const historyStr = ((await oracle.op(DBSchemas.READINGS).query<{ history: string }>(`
  
    SELECT history "history"
    FROM ${config.source_name}
    WHERE id = :id
  
  `, [id])).rows[0] || null)?.history || '[]';

  return JSON.parse(historyStr);
}