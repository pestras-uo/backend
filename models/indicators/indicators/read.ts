import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { omit } from "../../../util/pick-omit";
import { DBIndicator, Indicator } from "./interface";

export async function get(id: string) {
  const result = (await oracle.op().query<DBIndicator & { category_id: string }>(`

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
      create_by "create_by",
      update_date "update_date",
      update_by "update_by",
      categories "categories"
    FROM
      ${TablesNames.INDICATORS}
    WHERE
      id = :a

  `, [id, 0])).rows[0] || null;

  return result
    ? { ...omit(result, ['categories']), categories: JSON.parse(result.categories) } as Indicator
    : null;
}

export async function getByTopic(topic_id: string, parent_orgunits: string[], active = 1) {
  const result = (await oracle.op().query<DBIndicator & { category_id: string }>(`

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
      create_by "create_by",
      update_date "update_date",
      update_by "update_by",
      categories "categories"
    FROM
      ${TablesNames.INDICATORS}
    WHERE
      topic_id = :a 
      AND is_active = :b
      AND (${parent_orgunits.map((_, i) => `orgunit_id LIKE :c${i}`).join(' OR ')}) 

  `, [topic_id, active, parent_orgunits.map(p => `${p}%`)])).rows || [];

  return result.map(i => ({
    ...omit(i, ['categories']),
    categories: JSON.parse(i.categories)
  } as Indicator));
}

export async function getByOrgunit(orgunit_id: string, active = 1) {
  const result = (await oracle.op().query<DBIndicator & { category_id: string }>(`

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
      create_by "create_by",
      update_date "update_date",
      update_by "update_by",
      categories "categories"
    FROM
      ${TablesNames.INDICATORS}
    WHERE
      orgunit_id = :a AND is_active = :b

  `, [orgunit_id, active])).rows || [];

  return result.map(i => ({
    ...omit(i, ['categories']),
    categories: JSON.parse(i.categories)
  } as Indicator));
}

export async function getIndicatorsWithProjection(columns: string[]) {
  const result = (await oracle.op().query<DBIndicator>(`
  
    SELECT
      id "id",
      ${columns.map(c => `${c} "${c}"`).join(",")}
    FROM
      ${TablesNames.INDICATORS}
  `)).rows || [];

  if (columns.includes('categories'))
    return result.map(i => ({
      ...omit(i, ['categories']),
      categories: JSON.parse(i.categories)
    } as Indicator));

  return result as unknown as Indicator[];
}