import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { Indicator } from "./interface";
import { exists } from "./util";

export async function update(id: string, ind: Partial<Indicator>) {
  if (!(await exists(id)))
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorNotFound');

  const date = new Date();

  await oracle.op()
    .write(`
    
      UPDATE ${TablesNames.INDICATORS}
      SET name_ar = :a, name_en = :b, desc_ar = :c, desc_en = :d, unit_ar = :e, unit_en = :f, update_date = :g
      WHERE id = :h

    `, [
      ind.name_ar,
      ind.name_en,
      ind.desc_ar,
      ind.desc_en,
      ind.unit_ar,
      ind.unit_en,
      date,
      id
    ])
    .commit();

  return date;
}

export async function updateOrgunit(id: string, orgunit_id: string) {
  if (!(await exists(id)))
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorNotFound');

  const date = new Date();

  await oracle.op()
    .write(`
    
      UPDATE ${TablesNames.INDICATORS}
      SET orgunit_id = :a, update_date = :b
      WHERE id = :c
    
    `, [orgunit_id, date, id])
    .commit();

  return date;
}

export async function updateTopic(id: string, topic_id: string) {
  if (!(await exists(id)))
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorNotFound');

  const date = new Date();

  await oracle.op()
    .write(`
    
      UPDATE ${TablesNames.INDICATORS}
      SET topic_id = :a, update_date = :b
      WHERE id = :c
    
    `, [topic_id, date, id])
    .commit();

  return date;
}

export async function activate(id: string, state = 1) {
  if (!(await exists(id)))
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorNotFound');

  const date = new Date();

  await oracle.op()
    .write(`
    
      UPDATE ${TablesNames.INDICATORS}
      SET is_active = :a, update_date = :b
      WHERE id = :c
    
    `, [state, date, id])
    .commit();

  return date;
}