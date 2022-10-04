import oracle, { DBSchemas } from "db/oracle";
import { HttpError } from "misc/errors";
import { HttpCode } from "misc/http-codes";
import { getArgumentIndicators } from "../config/arguments";
import { get as getConfig } from "../config/read";
import { getAdditionalColumns } from "../config/util";
import { IndicatorState } from "../indicators/interface";
import indModel from "../indicators";
import { IndicatorReading, ReadingHistoryItem } from "./interface";
import { getById } from "./read";

const chars = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z'.split(',');

export async function update(
  indicator_id: string,
  id: string,
  reading: { reading_value: number, note_ar?: string, note_en?: string, [key: string]: any }
) {
  const config = await getConfig(indicator_id);

  if (config.view_name)
    throw new HttpError(HttpCode.FORBIDDEN, 'indicatorReadingsAreExternal');

  if (config.equation)
    throw new HttpError(HttpCode.FORBIDDEN, 'indicatorReadingsAreAutoComputed');

  const curr_reading = await getById(indicator_id, id);

  if (!curr_reading)
    throw new HttpError(HttpCode.NOT_FOUND, 'readingNotFound');

  const addColumns = (await getAdditionalColumns(indicator_id))
    .map(c => c.column_name) as (keyof Omit<IndicatorReading, 'id'>)[];

  const history: ReadingHistoryItem[] = curr_reading.history
    ? JSON.parse(curr_reading.history)
    : [];

  const currState: ReadingHistoryItem = {
    reading_value: curr_reading.reading_value,
    note_ar: curr_reading.note_ar,
    note_en: curr_reading.note_en,
    update_date: curr_reading.update_date.toISOString()
  };

  for (const prop in reading) {
    if (addColumns.includes(prop as keyof Omit<IndicatorReading, 'id'>))
      currState[prop] = curr_reading[prop as keyof Omit<IndicatorReading, 'id'>]
  }

  history.push(currState);

  // update reading
  await oracle.op(DBSchemas.READINGS)
    .write(`
    
      UPDATE ${indicator_id}
      SET
        ${Object.keys(reading).map((k, i) => `${k} = :${chars[i]},`)}
        history = :x
        update_date = :y
      WHERE
        id = :z
    
    `, [
      ...Object.values(reading),
      JSON.stringify(history),
      new Date(),
      id
    ])
    .commit();

  // set indicator state to analyzing
  indModel.updateState(indicator_id, IndicatorState.ANALYZING);
  // set all indicators state that use this reading as argument
  // to computing
  getArgumentIndicators(indicator_id)
    .then(ids => indModel.updateManyState(ids, IndicatorState.COMPUTING));

  return true;
}

export async function approve(
  indicator_id: string,
  id: string,
  state = 1
) {
  const config = await getConfig(indicator_id);

  if (config.view_name)
    throw new HttpError(HttpCode.FORBIDDEN, 'indicatorReadingsAreExternal');

  if (config.equation)
    throw new HttpError(HttpCode.FORBIDDEN, 'indicatorReadingsAreAutoComputed');

  const reading = await getById(indicator_id, id);

  if (!reading)
    throw new HttpError(HttpCode.NOT_FOUND, 'readingNotFound');

  await oracle.op(DBSchemas.READINGS)
    .write(`

      UPDATE ${indicator_id}
      SET is_approved = :a, approve_date = :b
      WHERE id = :c
    
    `, [state, state ? new Date() : null, id])
    .commit();

  return true;
}