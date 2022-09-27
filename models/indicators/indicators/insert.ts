import { getChildren, TablesNames } from "../..";
import oracle, { DBSchemas } from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import serial from "../../../util/serial";
import { Indicator } from "./interface";
import { get } from "./read";
import { nameExists } from "./util";

export async function create(ind: Partial<Indicator>, parent?: string) {

  if (await nameExists(ind.NAME_AR, ind.NAME_EN))
    throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

  const siblings = !!parent ? [] : await getChildren(TablesNames.INDICATORS, parent!);
  const id = serial.gen(parent, siblings);

  await oracle.op()
    .write(`

      INSERT INTO ${TablesNames.INDICATORS} (
        id, 
        orgunit_id, 
        topic_id, 
        name_ar, 
        name_en, 
        desc_en, 
        desc_ar, 
        unit_ar, 
        unit_en
      )
      VALUES (:a, :b, :c, :d, :e, :f, :g, :h, :i)

    `, [
      id,
      ind.ORGUNIT_ID,
      ind.TOPIC_ID,
      ind.NAME_AR,
      ind.NAME_EN,
      ind.DESC_AR,
      ind.DESC_EN,
      ind.UNIT_AR,
      ind.UNIT_EN
    ])
    .commit();

  return get(id);
}