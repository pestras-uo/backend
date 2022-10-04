import oracle, { DBSchemas } from "db/oracle";
import { HttpError } from "misc/errors";
import { HttpCode } from "misc/http-codes";
import { get } from "../config/read";
import { getAdditionalColumns } from "../config/util";
import { IndicatorReading } from "./interface";
import { randomUUID } from 'crypto';

const chars = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z'.split(',');

export async function insert(
  indicator_id: string,
  reading: { reading_value: string, note_ar?: string, note_en?: string, [key: string]: any }
) {
  const config = await get(indicator_id);

  if (config.view_name)
    throw new HttpError(HttpCode.FORBIDDEN, 'indicatorReadingsAreExternal');

  if (config.equation)
    throw new HttpError(HttpCode.FORBIDDEN, 'indicatorReadingsAreAutoComputed');

  const addColumns = (await getAdditionalColumns(indicator_id))
    .map(c => c.column_name) as (keyof  Omit<IndicatorReading, 'id'>)[];
  const bindings: any[] = [
    randomUUID(),
    reading.reading_value,
    reading.note_ar,
    reading.note_en,
    !config.require_approval,
    config.require_approval ? null : new Date()
  ];

  for (const column of addColumns)
    bindings.push(reading[column]);

  await oracle.op(DBSchemas.READINGS)
    .write(`
    
      INSERT INTO ${indicator_id} (
        id,
        reading_value,
        note_ar,
        note_en,
        is_approved,
        approve_date
        ${
          addColumns.length 
          ? ',' + addColumns.join(',') 
          : ''
        }
      ) VALUES (
        :a, :b, :c, :d, :e, :f ${
          addColumns.length
          ? chars.slice(6, addColumns.length).join(',:')
          : ''
        }
      )
    `, bindings)
    .commit();

  return bindings[0] as string;
}