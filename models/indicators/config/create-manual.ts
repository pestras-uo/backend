import oracle, { DBSchemas } from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { TablesNames } from "../..";
import { ColumnType, IndConf, IndicatorInterval, IndicatorType, ReadingColumn } from "./interface";
import { exists } from "./util";
import { get } from "./read";
import { mapColumnTypeToDbType, systemColumns } from "../util";

export async function createManualIndicator(
  indicator_id: string,
  config: Omit<
    IndConf,
    'indicator_id' |
    'source_name' |
    'type' |
    'compute_options' |
    'filter_options' |
    'state'
  >
) {
  if (await exists(indicator_id))
    throw new HttpError(HttpCode.CONFLICT, "indicatorConfigAlreadyExists");

  if (!config.columns.find(c => c.is_reading_value))
    throw new HttpError(HttpCode.BAD_REQUEST, 'readingValueColumnIsRequired');

  if (config.intervals && !config.columns.find(c => c.is_reading_date))
    throw new HttpError(HttpCode.BAD_REQUEST, 'readingDateColumnIsRequired');

  // prepare reading columns
  const columns: ReadingColumn[] = [];

  // add sys columns
  columns.push(systemColumns.id);
  columns.push(systemColumns.is_approved);
  columns.push(systemColumns.approve_date);
  columns.push(systemColumns.create_date);
  columns.push(systemColumns.create_by);
  columns.push(systemColumns.update_date);
  columns.push(systemColumns.update_by);
  columns.push(systemColumns.history);

  for (const col of config.columns)
    columns.push(col);

  await oracle.op()
    // insert indicator config 
    .write(`
    
      INSERT INTO ${TablesNames.IND_CONF} (
        indicator_id,
        source_name,
        type,
        intervals,
        evaluation_day,
        kpi_min,
        kpi_max,
        columns
      ) VALUES (:a, :b, :c, :d, :e, :f, :g, :h)
    
    `, [
      indicator_id,
      indicator_id,
      IndicatorType.MANUAL,
      config.intervals ?? IndicatorInterval.NONE,
      config.evaluation_day ?? 1,
      config.kpi_min || null,
      config.kpi_max || null,
      JSON.stringify(config.columns)
    ])
    .commit();

  // create indicator readings table
  await oracle.op(DBSchemas.READINGS)
    .write(`
      
      CREATE TABLE ${indicator_id} (
        ${columns.map(c => c.name + ' ' + mapColumnTypeToDbType(c.type)).join(',')}
      )
    `)
    .commit();

  return get(indicator_id);
}