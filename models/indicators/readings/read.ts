import oracle, { DBSchemas } from '../../../db/oracle';
import { HttpError } from '../../../misc/errors';
import { HttpCode } from '../../../misc/http-codes';
import { get as getConfig } from '../config/read'
import { getAdditionalColumns } from '../config/util';
import { IndicatorReading } from './interface';

export async function get(
  indicator_id: string,
  offset = 0,
  limit = 100
) {
  const config = await getConfig(indicator_id);

  if (config.view_name)
    return getViewReadings(indicator_id, offset, limit, config.view_name);

  const additionalColumns = (await getAdditionalColumns(indicator_id))
    .map(c => `${c.column_name} '${c.column_name}'`).join(',');

  return (await oracle.op(DBSchemas.READINGS)
    .query<IndicatorReading>(`
    
      SELECT
        id 'id',
        reading_value 'reading_value',
        ${!!additionalColumns ? additionalColumns + ',' : ''}
        note_ar 'note_ar',
        note_en 'note_en',
        is_approved 'is_approved',
        approve_date 'approve_date',
        create_date 'create_date',
        update_date 'update_date'
      FROM ${indicator_id}
        OFFSET :b ROWS
        FETCH NEXT :c ROWS ONLY

    `, [offset, limit])).rows || [];
}



export async function getViewReadings(
  indicator_id: string,
  offset = 0,
  limit = 100,
  view_name = ''
) {
  view_name = view_name || (await getConfig(indicator_id)).view_name;

  if (!view_name)
    throw new HttpError(HttpCode.NOT_FOUND, 'viewNameNotFound', { indicator_id });

  return (await oracle.op(DBSchemas.READINGS)
    .query<IndicatorReading>(`
    
      SELECT *
      FROM ${view_name}
      OFFSET :a ROWS
      FETCH NEXT :b ROWS ONLY

    `, [offset, limit])).rows || [];
}


export async function getById(
  indicator_id: string,
  id: string
) {
  const config = await getConfig(indicator_id);
  const readingTableName = config.view_name || indicator_id;
  const additionalColumns = (await getAdditionalColumns(indicator_id))
    .map(c => `${c.column_name} '${c.column_name}'`).join(',');

  return (await oracle.op(DBSchemas.READINGS)
    .query<IndicatorReading>(`
    
      SELECT
        id 'id',
        reading_value 'reading_value',
        ${!!additionalColumns ? additionalColumns + ',' : ''}
        note_ar 'note_ar',
        note_en 'note_en',
        is_approved 'is_approved',
        approve_date 'approve_date',
        create_date 'create_date',
        update_date 'update_date'
      FROM ${readingTableName}
      WHERE id = :a

    `, [id])).rows[0] || null;
}