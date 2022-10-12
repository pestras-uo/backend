import oracle, { DBSchemas } from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { get as getConfig } from "../config/read";
import { IndicatorState, IndicatorType } from "../config/interface";
import configModel from "../config";
import { ReadingHistoryItem } from "./interface";
import { getById } from "./read";

export async function update(
  indicator_id: string,
  id: string,
  reading: { [key: string]: any },
  issuer: string
) {
  const config = await getConfig(indicator_id);

  if (config.type === IndicatorType.EXTERNAL)
    throw new HttpError(HttpCode.FORBIDDEN, 'indicatorReadingsAreExternal');

  if (config.type === IndicatorType.COMPUTATIONAL)
    throw new HttpError(HttpCode.FORBIDDEN, 'indicatorReadingsAreAutoComputed');

  if (config.type === IndicatorType.PARTITION)
    throw new HttpError(HttpCode.FORBIDDEN, 'indicatorReadingsAreOnlyReferences');

  const curr_reading = await getById(indicator_id, id);

  if (!curr_reading)
    throw new HttpError(HttpCode.NOT_FOUND, 'readingNotFound');
  
  const insertedColumns: { name: string, value: any }[] = [];

  for (const colName in reading) {
    const column = config.columns.find(c => c.name === colName);

    if (!column)
      throw new HttpError(HttpCode.NOT_FOUND, 'columnNotFound', { column: colName });

    if (column.is_system)
      throw new HttpError(HttpCode.FORBIDDEN, 'cannotSetSystemColumnValue', { column: colName });

    insertedColumns.push({ name: colName, value: reading[colName] });
  }

  const history: ReadingHistoryItem[] = curr_reading.history
    ? JSON.parse(curr_reading.history)
    : [];

  const currState: ReadingHistoryItem = {
    update_date: curr_reading.update_date.toISOString(),
    update_by: curr_reading.update_by
  };

  for (const column of insertedColumns)
    currState[column.name] = curr_reading[column.name];

  history.push(currState);

  const bindings: any[] = [
    0,
    JSON.stringify(history),
    new Date(),
    issuer,
    ...insertedColumns.map(c => c.value),
    id
  ];

  // update reading
  await oracle.op(DBSchemas.READINGS)
    .write(`
    
      UPDATE ${config.source_name}
      SET
        is_approved = :a
        history = :b,
        update_date = :c,
        update_by = :d
        ${insertedColumns.map((c, i) => `${c.name} = :e${i}`).join(',')}
      WHERE
        id = :f
    
    `, bindings)
    .commit();

  // set indicator state to analyzing
  configModel.updateState(indicator_id, IndicatorState.ANALYZING);

  return true;
}




// approve
// -------------------------------------------------------------------------------------
export async function approve(
  indicator_id: string,
  id: string,
  state = 1
) {
  const config = await getConfig(indicator_id);

  if (config.type !== IndicatorType.MANUAL)
    throw new HttpError(HttpCode.FORBIDDEN, 'indicatorReadingsCannotBeApproved');

  const reading = await getById(indicator_id, id);

  if (!reading)
    throw new HttpError(HttpCode.NOT_FOUND, 'readingNotFound');

  await oracle.op(DBSchemas.READINGS)
    .write(`

      UPDATE ${config.source_name}
      SET is_approved = :a, approve_date = :b
      WHERE id = :c
    
    `, [state, state ? new Date() : null, id])
    .commit();

  return true;
}