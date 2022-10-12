import oracle, { DBSchemas } from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { TablesNames } from "../../";
import { IndConf, IndicatorInterval, IndicatorType, ReadingColumn } from "./interface";
import { exists } from "./util";
import { mapColumnTypeToDbType, systemColumns } from "../util";
import { get } from "./read";

export async function createComputationalIndicator(
  indicator_id: string,
  config: Omit<
    IndConf,
    'indicator_id' |
    'source_name' |
    'type' |
    'state' |
    'filter_options'
  >
) {

  // make sure indicator has no config made already
  if (await exists(indicator_id))
    throw new HttpError(HttpCode.CONFLICT, "indicatorConfigAlreadyExists");

  // make sure compute options are provided
  // and at least one argument provided as well
  if (!config.compute_options || config.compute_options.arguments.length === 0)
    throw new HttpError(HttpCode.NOT_EXTENDED, "argumentsAreRequired");

  if (!config.columns.find(c => c.is_reading_value))
    throw new HttpError(HttpCode.BAD_REQUEST, 'readingValueColumnIsRequired');

  if (config.intervals && !config.columns.find(c => c.is_reading_date))
    throw new HttpError(HttpCode.BAD_REQUEST, 'readingDateColumnIsRequired');

  // prepare reading columns
  const columns = new Map<string, ReadingColumn>();
  const argsColumns: { [key: string]: ReadingColumn[] } = {};


  // add id column
  columns.set("id", systemColumns.id);
  columns.set("create_date", systemColumns.create_date);

  // loop arguments and get additional column if provided
  for (const arg of config.compute_options.arguments) {
    // get argument columns
    argsColumns[arg.variable] = (await get(indicator_id)).columns;

    // clone additional columns when provided
    if (arg.clone_columns.length > 0) {
      for (const columnName of arg.clone_columns) {
        const column = argsColumns[arg.variable].find(c => c.name === columnName);

        if (!column || column.is_system || column.is_reading_date || column.is_reading_value)
          continue;

        columns.set(column.name, argsColumns[arg.variable].find(c => c.name === column.name));
      }
    }

    // clone any column used in join clause
    if (config.compute_options.join_on.length > 0) {

      for (const join of config.compute_options.join_on) {
        const [variable, column_name] = join[0].split('.');

        if (columns.has(column_name))
          continue;

        if (!argsColumns[variable])
          throw new HttpError(HttpCode.BAD_REQUEST, `undefinedVariable`, variable);

        const column = argsColumns[variable].find(c => c.name === column_name);

        if (!column)
          throw new HttpError(HttpCode.BAD_REQUEST, `columnNotFound`, column_name);

        columns.set(column_name, column);
      }
    }
  }

  await oracle.op()
    // insert indicator config 
    .write(`
    
      INSERT INTO ${TablesNames.IND_CONF} (
        indicator_id,
        source_name,
        type,
        intervals,
        evaluation_day,
        compute_options,
        kpi_min,
        kpi_max,
        columns
      ) VALUES (:a, :b, :c, :d, :e, :f, :g, :h, :i)
    
    `, [
      indicator_id,
      indicator_id,
      IndicatorType.COMPUTATIONAL,
      config.intervals ?? IndicatorInterval.NONE,
      config.evaluation_day ?? 1,
      config.compute_options,
      config.kpi_min || null,
      config.kpi_max || null,
      JSON.stringify(columns)
    ])
    .commit();

  // create indicator readings table
  await oracle.op(DBSchemas.READINGS)
    .write(`
      
      CREATE TABLE ${indicator_id} (
        ${Array.from(columns.values()).map(c => c.name + ' ' + mapColumnTypeToDbType(c.type)).join(',')}
      )    
    `)
    .commit();

  return get(indicator_id);
}