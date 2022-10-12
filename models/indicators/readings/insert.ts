import oracle, { DBSchemas } from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { get as getConfig } from "../config/read";
import { randomUUID } from 'crypto';
import { getById } from "./read";
import { ColumnType, IndicatorType } from "../config/interface";

export async function insert(
  indicator_id: string,
  reading: { [key: string]: any },
  issuer: string
) {
  const config = await getConfig(indicator_id);

  if (config.type == IndicatorType.EXTERNAL)
    throw new HttpError(HttpCode.FORBIDDEN, 'indicatorReadingsAreExternal');

  if (config.type == IndicatorType.COMPUTATIONAL)
    throw new HttpError(HttpCode.FORBIDDEN, 'indicatorReadingsAreAutoComputed');

  if (config.type === IndicatorType.PARTITION)
    throw new HttpError(HttpCode.FORBIDDEN, 'indicatorReadingsAreOnlyReferences');

  const id = randomUUID();
  const insertedColumns: { name: string, value: any }[] = [];
  let columnsMustInsertCount = config.columns.filter(c => c.is_system && c.type !== ColumnType.TEXT).length;
  let valueIsSet = false;
  let dateIsSet = false;

  for (const colName in reading) {
    const column = config.columns.find(c => c.name === colName);

    if (!column)
      throw new HttpError(HttpCode.NOT_FOUND, 'columnNotFound', { column: colName });

    if (column.is_system)
      throw new HttpError(HttpCode.FORBIDDEN, 'cannotSetSystemColumnValue', { column: colName });

    insertedColumns.push({ name: colName, value: reading[colName] });

    if (column.is_reading_value)
      valueIsSet = true;
    if (column.is_reading_date)
      dateIsSet = true;

    if (column.type !== ColumnType.TEXT)
      columnsMustInsertCount--;
  }

  if (!valueIsSet)
    throw new HttpError(HttpCode.BAD_REQUEST, 'readingValueIsRequred');

  if (config.intervals && !dateIsSet)
    throw new HttpError(HttpCode.BAD_REQUEST, 'readingDateIsRequred');

  if (columnsMustInsertCount > 0)
    throw new HttpError(HttpCode.BAD_REQUEST, 'notAllRequiredColumnWhereProvided');

  const bindings: any[] = [
    id,
    new Date(),
    issuer,
    0,
    "[]"
  ];

  for (const column of insertedColumns)
    bindings.push(column.value);

  await oracle.op(DBSchemas.READINGS)
    .write(`
    
      INSERT INTO ${config.source_name} (
        id,
        create_date,
        create_by,
        is_approved,
        history,
        ${insertedColumns.map(c => c.name)}
      ) VALUES (
        :a, :b, :c, :d, :e, ${insertedColumns.map((_, i) => `:f${i}`).join(',')}
      )
    `, bindings)
    .commit();

  return getById(indicator_id, id);
}