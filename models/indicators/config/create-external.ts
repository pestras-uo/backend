import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { TablesNames } from "../..";
import { ColumnType, IndConf, IndicatorInterval, IndicatorType } from "./interface";
import { exists } from "./util";
import { get } from "./read";

export async function createExternalIndicator(
  indicator_id: string,
  config: Omit<
    IndConf,
    'indicator_id' |
    'type' |
    'evaluation_day' |
    'require_approval' |
    'compute_options' |
    'state'
  >
) {
  if (await exists(indicator_id))
    throw new HttpError(HttpCode.CONFLICT, "indicatorConfigAlreadyExists");

  config.columns[0].type = ColumnType.NUMBER;

  if (config.intervals !== IndicatorInterval.NONE && (!config.columns[2] || config.columns[2].type !== ColumnType.DATE))
    throw new HttpError(HttpCode.BAD_REQUEST, 'dateColumnIsRequired');

  await oracle.op()
    // insert indicator config 
    .write(`
    
      INSERT INTO ${TablesNames.IND_CONF} (
        indicator_id,
        source_name,
        type,
        intervals,
        kpi_min,
        kpi_max,
        columns,
        filter_options
      ) VALUES (:a, :b, :c, :d, :e, :f, :g)
    
    `, [
      indicator_id,
      config.source_name,
      IndicatorType.EXTERNAL,
      config.intervals ?? IndicatorInterval.NONE,
      config.kpi_min || null,
      config.kpi_max || null,
      JSON.stringify(config.columns),
      config.filter_options
    ])
    .commit();

  return get(indicator_id);
}