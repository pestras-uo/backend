import oracle from "../db/oracle";
import Serial from '../util/serial';

export async function getByRowId<T>(table: string, rowid: string) {
  return (await oracle.exec<T>(`
  
    SELECT *
    FROM :table
    WHERE rowid = :rowid
  
  `, [table, rowid])).rows?.[0];
}

export async function getChildren(table: string, serial: string) {
  const result = await oracle.exec<{ SERIAL: string }>(`

    SELECT serial
    FROM ${table}
    WHERE serial LIKE '${serial}%'

  `);

  if (!result.rows)
    return [];

  return result
    .rows
    .filter(row => row.SERIAL === serial)
    .map(row => Serial.last(row.SERIAL));
}