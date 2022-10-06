import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { TablesNames } from "../../";
import { IndicatorConfig, IndicatorState } from "./interface";
import { exists, existsMany } from "./util";

export async function update(
  indicator_id: string,
  config: Omit<IndicatorConfig, 'indicator_id' | 'view_name' | 'equation' | 'match_by_columns'>
) {
  if (!(await exists(indicator_id)))
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorConfigNotFound');

  await oracle.op()
    .write(`
  
      UPDATE ${TablesNames.IND_CONF}
      SET 
        reading_value_name_ar = :a,
        reading_value_name_en = :b,
        interval = :c,
        evaluation_day = :d,
        required_aproval = :e,
        kpi_min = :f,
        kpi_max = :g
      WHERE indicator_id = :h
  
    `, [
      config.reading_value_name_ar,
      config.reading_value_name_en,
      config.intervals,
      config.evaluation_day,
      config.require_approval,
      config.kpi_min ?? null,
      config.kpi_max ?? null,
      indicator_id
    ])
    .commit();

  return true;
}


export async function updateState(id: string, state = IndicatorState.IDLE) {
  if (!(await exists(id)))
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorNotFound');

  await oracle.op()
    .write(`
    
      UPDATE ${TablesNames.INDICATORS}
      SET state = :a, update_date = :b
      WHERE id = :c
    
    `, [state, new Date(), id])
    .commit();

  return true;
}


export async function updateManyState(ids: string[], state = IndicatorState.IDLE) {
  if (!(await existsMany(ids)))
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorNotFound');

  await oracle.op()
    .write(`
    
      UPDATE ${TablesNames.INDICATORS}
      SET state = :a, update_date = :b
      WHERE id IN :c
    
    `, [state, new Date(), ids])
    .commit();

  return true;
}