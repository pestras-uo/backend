import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { omit } from "../../../util/pick-omit";
import { Indicator, IndicatorDetails, IndicatorDetailsQueryResultItem } from "./interface";

export async function getPage(offset = 0, limit = 100, active = 1) {
  return (await oracle.op().query<Indicator>(`

    SELECT
      id 'id',
      orgunit_id 'orgunit_id',
      topic_id 'topic_id',
      name_ar 'name_ar',
      name_en 'name_en',
      desc_ar 'desc_ar',
      desc_en 'desc_en',
      unit_ar 'unit_ar',
      unit_en 'unit_en',
      is_active 'is_active',
      create_date 'create_date',
      update_date 'update_date'
    FROM ${TablesNames.INDICATORS}
    WHERE is_active = :a
    OFFSET :b ROWS
    FETCH NEXT :c ROWS ONLY

  `, [active, offset, limit])).rows || [];
}

export async function get(id: string) {
  const result = (await oracle.op().query<IndicatorDetailsQueryResultItem>(`

    SELECT
      I.id 'id',
      I.orgunit_id 'orgunit_id',
      I.topic_id 'topic_id',
      I.name_ar 'name_ar',
      I.name_en 'name_en',
      I.desc_ar 'desc_ar',
      I.desc_en 'desc_en',
      I.unit_ar 'unit_ar',
      I.unit_en 'unit_en',
      I.is_active 'is_active',
      I.create_date 'create_date',
      I.update_date 'update_date'
      IG.group_id 'group_id',
      IC.category_id 'category_id'
    FROM
      ${TablesNames.INDICATORS} I,
      ${TablesNames.IND_GROUP} IG,
      ${TablesNames.IND_CAT} IC
    WHERE
      I.id = :a
      AND I.id = IG.indicator_id
      AND I.id = IC.indicator_id

  `, [id])).rows || [];

  if (result.length === 0)
    return null;

  const indicator = omit<IndicatorDetails, IndicatorDetailsQueryResultItem>(result[0], [
    'group_id',
    'category_id',
  ]);

  const groups = new Set<number>();
  const categories = new Set<number>();

  for (const rec of result) {
    groups.add(rec.group_id);
    categories.add(rec.category_id);
  }

  indicator.groups = Array.from(groups);
  indicator.categories = Array.from(categories);

  return indicator;
}

export async function getByTopic(topic_id: string, active = 1) {
  return (await oracle.op().query<Indicator>(`

    SELECT
      id 'id',
      orgunit_id 'orgunit_id',
      topic_id 'topic_id',
      name_ar 'name_ar',
      name_en 'name_en',
      desc_ar 'desc_ar',
      desc_en 'desc_en',
      unit_ar 'unit_ar',
      unit_en 'unit_en',
      is_active 'is_active',
      create_date 'create_date',
      update_date 'update_date'
    FROM ${TablesNames.INDICATORS}
    WHERE topic_id = :a AND is_active = ${active}

  `, [topic_id])).rows || [];
}

export async function getByOrgunit(orgunit_id: string, active = 1) {
  return (await oracle.op().query<Indicator>(`

    SELECT
      id "id",
      orgunit_id "orgunit_id",
      topic_id "topic_id",
      name_ar "name_ar",
      name_en "name_en",
      desc_ar "desc_ar",
      desc_en "desc_en",
      unit_ar "unit_ar",
      unit_en "unit_en",
      is_active "is_active",
      create_date "create_date",
      update_date "update_date"
    FROM ${TablesNames.INDICATORS}
    WHERE orgunit_id = :a AND is_active = ${active}

  `, [orgunit_id])).rows || [];
}