import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { TablesNames } from "../../";
import { IndicatorConfig, IndicatorInterval, ReadingColumn } from "./interface";
import { exists } from "./util";
import { randomUUID } from 'crypto';

export async function createViewIndicator(
  indicator_id: string,
  config: Omit<IndicatorConfig, 'indicator_id'>,
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
        kpi_min,
        kpi_max,
        view_name
      ) VALUES (:a, :b, :c, :d, :e, :f, :g)
    
    `, [
      indicator_id,
      config.reading_value_name_ar,
      config.reading_value_name_en,
      config.intervals ?? IndicatorInterval.NONE,
      config.kpi_min || null,
      config.kpi_max || null,
      config.view_name
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

  return true;
}