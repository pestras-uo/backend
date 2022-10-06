import oracle, { DBSchemas } from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { TablesNames } from "../../";
import { ColumnType, IndicatorArgument, IndicatorConfig, IndicatorInterval, ReadingColumn } from "./interface";
import { exists, getAdditionalColumns } from "./util";
import { randomUUID } from 'crypto';

export async function createComputationalIndicator(
  indicator_id: string,
  config: Omit<IndicatorConfig, 'indicator_id' | 'require_approval' | 'view_name' | 'match_by_columns'>,
  args: Omit<IndicatorArgument, 'indicator_id'>[],
  matchBy: string[][] = []
) {

  if (await exists(indicator_id))
    throw new HttpError(HttpCode.CONFLICT, "indicatorConfigAlreadyExists");

  if (args.length === 0)
    throw new HttpError(HttpCode.NOT_EXTENDED, "argumentsAreRequired");

  const additionalColumns = new Map<string, ReadingColumn>();
  const argsColumns: { [key: string]: ReadingColumn[] } = {};

  if (matchBy.length > 0) {
    for (const arg of args)
      argsColumns[arg.variable] = await getAdditionalColumns(indicator_id);

    for (const match of matchBy) {
      for (const part of match) {
        const [variable, column_id] = part.split('.');

        if (!argsColumns[variable])
          throw new HttpError(HttpCode.BAD_REQUEST, `undefinedVariable`, variable);

        const column = argsColumns[variable].find(c => c.id === column_id);

        if (!column)
          throw new HttpError(HttpCode.BAD_REQUEST, `columnNotFound`, column_id);

        additionalColumns.set(column_id, column);
      }
    }
  }

  await oracle.op()
    // insert indicator config 
    .write(`
    
      INSERT INTO ${TablesNames.IND_CONF} (
        indicator_id,
        reading_value_name_ar,
        reading_value_name_en,
        intervals,
        evaluation_day,
        equation,
        match_by_columns,
        kpi_min,
        kpi_max
      ) VALUES (:a, :b, :c, :d, :e, :f, :g, :h, :i)
    
    `, [
      indicator_id,
      config.reading_value_name_ar,
      config.reading_value_name_en,
      config.intervals ?? IndicatorInterval.NONE,
      config.evaluation_day ?? 1,
      config.equation,
      JSON.stringify(matchBy),
      config.kpi_min || null,
      config.kpi_max || null
    ])
    // insert indicator reading additional columns
    .writeMany(`
    
      INSERT INTO ${TablesNames.READ_ADD_COLS} (
        id, indicator_id, column_name, type, name_ar, name_en
      ) VALUES (
        :a, :b, :c, :d, :e, :f
      )
    
    `, Array.from(additionalColumns.values()).map(c => [
      randomUUID(),
      indicator_id,
      c.column_name,
      c.name_ar,
      c.name_en,
      c.type
    ]))
    .commit();

  // create indicator readings table
  await oracle.op(DBSchemas.READINGS)
    .write(`
      
        CREATE TABLE ${indicator_id} (
          id NVARCHAR(36) CONSTRAINT ${indicator_id}_pk PRIMARY KEY,
          reading_value Number NOT NULL,
          note_ar NVARCHAR(128),
          note_en NVARCHAR(128),
          is_approved NUMBER DEFAULT :a,
          approve_date DATE,
          create_date DATE DEFAULT SYSDATE,
          update_date DATE,
          ${additionalColumns.size > 0
        ? Array.from(additionalColumns.values())
          .map(c => c.column_name + ' ' + mapCatTypeToDbType(c.type)).join(',') + ','
        : ''
      }
          history NVARCHAR(1024)
        )
      
      `, [1])
    .commit();

  return true;
}

// util
function mapCatTypeToDbType(type: ColumnType) {
  return type === ColumnType.NUMBER
    ? 'NUMBER'
    : ColumnType.TEXT
      ? 'VARCHAR2(64)'
      : 'DATE'
}