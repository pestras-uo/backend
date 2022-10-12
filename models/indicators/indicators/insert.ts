import { getChildren, TablesNames } from "../..";
import oracle from "../../../db/oracle";
import serial from "../../../util/serial";
import { Indicator } from "./interface";
import { get } from "./read";

export async function create(ind: Omit<Indicator, 'id' | 'create_date' | 'create_by' | 'update_date' | 'update_by' | 'is_active'>, parent_id: string, issuer_id: string) {
  const id = serial.gen(parent_id, !!parent_id ? [] : await getChildren(TablesNames.INDICATORS, parent_id!));

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
        unit_en,
        categories,
        create_by
      )
      VALUES (:a, :b, :c, :d, :e, :f, :g, :h, :i, :j, :k)

    `, [
      id,
      ind.orgunit_id,
      ind.topic_id,
      ind.name_ar,
      ind.name_en,
      ind.desc_ar,
      ind.desc_en,
      ind.unit_ar,
      ind.unit_en,
      JSON.stringify(ind.categories),
      issuer_id
    ])
    .commit();

  return get(id);
}