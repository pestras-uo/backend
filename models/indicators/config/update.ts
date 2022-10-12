import oracle from "../../../db/oracle";
import { TablesNames } from "../../";
import { ColumnType, FilterOptions, IndConf, IndicatorState, IndicatorType, ReadingColumn } from "./interface";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { get } from "./read";

export async function update(
  indicator_id: string,
  config: Omit<
    IndConf,
    'indicator_id' |
    'source_name' |
    'type' |
    'state' |
    'is_partition' |
    'compute_options' |
    'filter_options' |
    'columns'
  >
) {
  const currConf = await get(indicator_id);

  if (!currConf)
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorConfigNotFound');

  if (currConf.type !== IndicatorType.COMPUTATIONAL)
    throw new HttpError(HttpCode.FORBIDDEN, 'cannotChangeNoneComputationalIndicatorState');

  await oracle.op()
    .write(`
  
      UPDATE ${TablesNames.IND_CONF}
      SET 
        interval = :c,
        evaluation_day = :d,
        kpi_min = :f,
        kpi_max = :g
      WHERE 
        indicator_id = :h OR (indicator_id LIKE :i AND type = :j)
    `, [
      config.intervals,
      config.evaluation_day,
      config.kpi_min ?? null,
      config.kpi_max ?? null,
      indicator_id,
      `${indicator_id}_%`,
      IndicatorType.PARTITION
    ])
    .commit();

  return true;
}


export async function updateState(id: string, state = IndicatorState.IDLE) {
  const currConf = await get(id);

  if (!currConf)
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorConfigNotFound');

  if (currConf.type !== IndicatorType.COMPUTATIONAL)
    throw new HttpError(HttpCode.FORBIDDEN, 'cannotChangeNoneComputationalIndicatorState');

  await oracle.op()
    .write(`
    
      UPDATE ${TablesNames.INDICATORS}
      SET state = :a, update_date = :b
      WHERE id = :c
    
    `, [state, new Date(), id])
    .commit();

  return true;
}

// TODO
export async function updateExternalIndicatorConfig(
  id: string,
  source_name: string,
  filter_options: FilterOptions,
  columns: ReadingColumn[] = []
) {
  const currConf = await get(id);

  if (!currConf)
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorConfigNotFound');

  if (currConf.type !== IndicatorType.EXTERNAL)
    throw new HttpError(HttpCode.FORBIDDEN, 'cannotChangeNoneExternalIndicatorConfig');

  if (!columns.length)
    throw new HttpError(HttpCode.BAD_REQUEST, 'readingValueColumnIsRequired');

  if (currConf.intervals && (!columns[2] || columns[2].type !== ColumnType.DATE))
    throw new HttpError(HttpCode.BAD_REQUEST, 'dateColumnIsRequired');

  await oracle.op()
    .write(`
    
      UPDATE ${TablesNames.IND_CONF}
      SET source_name = :a = :b, filter_options = :c columns = :d
      WHERE id = :e OR (indicator_id id LIKE :f AND type = :g) 
    
    `, [source_name, filter_options, JSON.stringify(columns), id, `${id}_%`, IndicatorType.PARTITION])
    .commit();

  return true;
}