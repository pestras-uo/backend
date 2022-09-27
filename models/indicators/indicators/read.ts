import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { omit } from "../../../util/pick-omit";
import { Indicator, IndicatorDetails, IndicatorDetailsQueryResultItem } from "./interface";

export async function getPage(offset = 0, limit = 100, active = 1) {
  return (await oracle.op().read<Indicator>(`

    SELECT * 
    FROM ${TablesNames.INDICATORS}
    WHERE is_active = ${active}
    OFFSET :a ROWS
    FETCH NEXT :b ROWS ONLY

  `, [offset, limit])).rows || [];
}

export async function get(id: string) {
  const result = (await oracle.op().read<IndicatorDetailsQueryResultItem>(`

    SELECT
      I.*,
      IG.GROUP_ID GROUP_ID,
      IC.CATEGORY_ID CATEGORY_ID
    FROM
      ${TablesNames.INDICATORS} I,
      ${TablesNames.INDICATOR_GROUP} IG,
      ${TablesNames.INDICATOR_CATEGORY} IC
    WHERE
      I.ID = :a
      AND I.ID = IG.INDICATOR_ID
      AND I.ID = IC.INDICATOR_ID

  `, [id])).rows || [];

  if (result.length === 0)
    return null;

  const indicator = omit<IndicatorDetails, IndicatorDetailsQueryResultItem>(result[0], [
    'GROUP_ID',
    'CATEGORY_ID',
  ]);

  const groups = new Set<number>();
  const categories = new Set<number>();

  for (const rec of result) {
    groups.add(rec.GROUP_ID);
    categories.add(rec.CATEGORY_ID);
  }

  indicator.GROUPS = Array.from(groups);
  indicator.CATEGORIES = Array.from(categories);

  return indicator;
}

export async function getByTopic(topic_id: string, active = 1) {
  return (await oracle.op().read(`

    SELECT *
    FROM ${TablesNames.INDICATORS}
    WHERE topic_id = :a AND is_active = ${active}

  `, [topic_id])).rows || [];
}

export async function getByOrgunit(orgunit_id: string, active = 1) {
  return (await oracle.op().read(`

    SELECT *
    FROM ${TablesNames.INDICATORS}
    WHERE orgunit_id = :a AND is_active = ${active}

  `, [orgunit_id])).rows || [];
}