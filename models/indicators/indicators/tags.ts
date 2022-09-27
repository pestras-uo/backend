import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { Tag, TagMap, TagQueryResult } from "../../misc/tags/interface";
import { exists } from "./util";

export async function getTags(indicator_id: string) {
  const result = (await oracle.op().read<TagQueryResult>(`

    SELECT
      K.ID ID,
      K.NAME_AR KEY_AR,
      K.NAME_EN KEY_EN,
      V.ID VALUE_ID,
      V.NAME_AR VALUE_AR,
      V.NAME_EN VALUE_EN
    FROM
      ${TablesNames.INDICATORS} I
    LEFT JOIN
      ${TablesNames.INDICATOR_TAG} IT ON T.ID = IT.INDICATOR_ID
    LEFT JOIN
      ${TablesNames.TAGS_VALUES} V ON V.ID = IT.TAG_VALUE_ID
    LEFT JOIN
      ${TablesNames.TAGS_KEYS} K ON K.ID = V.KEY_ID
    WHERE
      I.ID = :a
  
  `, [indicator_id])).rows || [];

  const tags = new Map<string, TagMap>;

  for (const doc of result) {
    let tag = tags.get(doc.ID);

    if (!tag) {
      tag = {
        ID: doc.ID,
        NAME_AR: doc.KEY_AR,
        NAME_EN: doc.KEY_EN,
        VALUES: new Map()
      };

      tag.VALUES.set(doc.VALUE_ID, {
        ID: doc.VALUE_ID,
        NAME_AR: doc.VALUE_AR,
        NAME_EN: doc.VALUE_EN
      });

    } else {
      if (!tag.VALUES.has(doc.VALUE_ID))
        tag.VALUES.set(doc.VALUE_ID, {
          ID: doc.VALUE_ID,
          NAME_AR: doc.VALUE_AR,
          NAME_EN: doc.VALUE_EN
        });
    }
  }

  return Array.from(tags.values()).map(tag => {
    return { ...tag, VALUES: Array.from(tag.VALUES.values()) };
  }) as Tag[];
}

export async function replaceTags(id: string, tags: string[]) {
  if (!(await exists(id)))
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorNotFound');

  await oracle.op().write(`
    
      DELETE FROM ${TablesNames.INDICATOR_TAG}
      WHERE indicator_id = :a
    
    `, [id])
    .writeMany(`
    
      INSERT INTO ${TablesNames.INDICATOR_TAG} (indicator_id, tag_value_id)
      VALUES (:a, :b)
    
    `, tags.map(t => [id, t]))
    .commit();

  return true;
}