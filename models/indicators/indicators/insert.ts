import { getChildren, TablesNames } from "../..";
import oracle, { DBSchemas } from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import serial from "../../../util/serial";
import { Indicator } from "./interface";
import { get } from "./read";

export async function create(ind: Partial<Indicator>, parent?: string) {
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
      ind.orgunit_id,
      ind.topic_id,
      ind.name_ar,
      ind.name_en,
      ind.desc_ar,
      ind.desc_en,
      ind.unit_ar,
      ind.unit_en
    ])
    .commit();

  return get(id);
}