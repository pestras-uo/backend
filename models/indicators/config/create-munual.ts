import oracle, { DBSchemas } from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { TablesNames } from "../../../models";
import { ColumnType, IndicatorConfig, IndicatorInterval, ReadingColumn } from "./interface";
import { exists } from "./util";
import { randomUUID } from 'crypto';

export async function createManualIndicator(
  indicator_id: string,
  config: Omit<IndicatorConfig, 'indicator_id' | 'view_name' | 'equation' | 'match_by_columns'>,
  additional_columns: Omit<ReadingColumn, 'id' | 'indicator_id'>[] = []
) {
  if (await exists(indicator_id))
    throw new HttpError(HttpCode.CONFLICT, "indicatorConfigAlreadyExists");

  await oracle.op()
    // insert indicator config 
    .write(`
    
      INSERT INTO ${TablesNames.IND_CONF} (
        indicator_id,
        reading_value_name_ar,
        reading_value_name_en,
        intervals,
        evaluation_day,
        require_approval,
        kpi_min,
        kpi_max
      ) VALUES (:a, :b, :c, :d, :e, :f, :g, :h)
    
    `, [
      indicator_id,
      config.reading_value_name_ar,
      config.reading_value_name_en,
      config.intervals ?? IndicatorInterval.NONE,
      config.evaluation_day ?? 1,
      config.require_approval,
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
    
    `, additional_columns.map(c => [
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
          ${additional_columns.length > 0
        ? additional_columns
          .map(c => c.column_name + ' ' + mapCatTypeToDbType(c.type)).join(',') + ','
        : ''
      }
          history NVARCHAR(1024)
        )
      
      `, [config.require_approval ? 0 : 1])
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