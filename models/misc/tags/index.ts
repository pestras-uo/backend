import { TablesNames } from "../..";
import oracle from "../../../db/oracle"
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { Tag, TagKey, TagMap, TagQueryResult, TagValue } from "./interface";
import { randomUUID } from 'crypto';

export default {


  // Getters
  // -------------------------------------------------------------------------------
  async getAll() {
    const result = (await oracle.op().read<TagQueryResult>(`

    SELECT
      K.ID ID,
      K.NAME_AR KEY_AR,
      K.NAME_EN KEY_EN,
      V.ID VALUE_ID,
      V.NAME_AR VALUE_AR,
      V.NAME_EN VALUE_EN
    FROM
      ${TablesNames.TOPICS} T
    LEFT JOIN
      ${TablesNames.TOPIC_TAG} TT ON T.ID = TT.TOPIC_ID
    LEFT JOIN
      ${TablesNames.TAGS_VALUES} V ON V.ID = TT.TAG_VALUE_ID
    LEFT JOIN
      ${TablesNames.TAGS_KEYS} K ON K.ID = V.KEY_ID
  
  `)).rows || [];

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
  },

  async getKeys() {
    return (await oracle.op().read<TagKey>(`
    
      SELECT *
      FROM ${TablesNames.TAGS_KEYS}
    
    `)).rows || [];
  },

  async getValues() {
    return (await oracle.op().read<TagValue>(`
    
      SELECT *
      FROM ${TablesNames.TAGS_VALUES}
    
    `)).rows || [];
  },

  async getKey(id: string) {
    return (await oracle.op().read<TagKey>(`
    
      SELECT *
      FROM ${TablesNames.TAGS_KEYS}
      WHERE id = :id
    
    `, [id])).rows?.[0] || null;
  },

  async getValue(id: string) {
    return (await oracle.op().read<TagValue>(`
    
      SELECT *
      FROM ${TablesNames.TAGS_VALUES}
      WHERE id = :id
    
    `, [id])).rows?.[0] || null;
  },




  // Util
  // -------------------------------------------------------------------------------
  async keyExists(id: string) {
    return (await oracle.op().read<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TablesNames.TAGS_KEYS}
      WHERE id = :a
  
  `, [id])).rows?.[0].COUNT! > 0;
  },

  async valueExists(id: string) {
    return (await oracle.op().read<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TablesNames.TAGS_VALUES}
      WHERE id = :a
  
  `, [id])).rows?.[0].COUNT! > 0;
  },

  async keyNameExists(name_ar: string, name_en: string) {
    return (await oracle.op().read<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TablesNames.TAGS_KEYS}
      WHERE name_ar = :a OR name_en = :b
    
    `, [name_ar, name_en])).rows?.[0].COUNT! > 0;
  },

  async valueNameExists(key_id: string, name_ar: string, name_en: string) {
    return (await oracle.op().read<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TablesNames.TAGS_VALUES}
      WHERE (name_ar = :a OR name_en = :b) AND tag_key_id = :c
    
    `, [name_ar, name_en, key_id])).rows?.[0].COUNT! > 0;
  },

  async updateKeyNameExists(id: string, name_ar: string, name_en: string) {
    return (await oracle.op().read<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TablesNames.TAGS_KEYS}
      WHERE (name_ar = :a OR name_en = :b) AND id <> :c
    
    `, [name_ar, name_en, id])).rows?.[0].COUNT! > 0;
  },

  async updateValueNameExists(key_id: string, value_id: string, name_ar: string, name_en: string) {
    return (await oracle.op().read<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TablesNames.TAGS_VALUES}
      WHERE (name_ar = :a OR name_en = :b) AND tag_key_id = :c AND id <> :d
    
    `, [name_ar, name_en, key_id, value_id])).rows?.[0].COUNT! > 0;
  },




  // create
  // -------------------------------------------------------------------------------
  async createKey(name_ar: string, name_en: string) {
    if (await this.keyNameExists(name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "tagKeyAlreadyExists");

    const id = randomUUID();
    await oracle.op()
      .write(`
      
        INSERT INTO ${TablesNames.TAGS_KEYS} (id, name_ar, name_en)
        VALUES(:a, :b, :c)
      
      `, [id, name_ar, name_en])
      .commit();

    return { ID: id, NAME_AR: name_ar, NAME_EN: name_en } as TagKey;
  },

  async createValue(key_id: string, name_ar: string, name_en: string) {
    if (await this.valueNameExists(key_id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "tagValueAlreadyExists");

    const id = randomUUID();

    await oracle.op()
      .write(`
      
        INSERT INTO ${TablesNames.TAGS_VALUES} (id, taag_key_id, name_ar, name_en)
        VALUES(:a, :b, :c, :d)
      
      `, [id, key_id, name_ar, name_en])
      .commit();

    return { ID: id, NAME_AR: name_ar, NAME_EN: name_en } as TagValue;
  },




  // update
  // -------------------------------------------------------------------------------
  async updateKey(id: string, name_ar: string, name_en: string) {
    if (await this.updateKeyNameExists(id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.TAGS_KEYS}
        SET name_ar = :a, name_en = :b
        WHERE id = :c
      
      `, [name_ar, name_en, id])
      .commit();

    return true;
  },

  async updateValue(key_id: string, value_id: string, name_ar: string, name_en: string) {
    if (await this.updateValueNameExists(key_id, value_id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.TAGS_VALUES}
        SET value_ar = :a, value_en = :b
        WHERE id = :c AND tag_key_id = :d
      
      `, [name_ar, name_en, value_id, key_id])
      .commit();

    return true;
  },




  // update
  // -------------------------------------------------------------------------------
  async deleteKey(id: string) {
    await oracle.op()
      .write(`
        DELETE FROM ${TablesNames.TAGS_KEYS}
        WHERE id = :id
      `, [id])
      .commit();

    return true;
  },

  async deleteValue(id: string) {
    await oracle.op()
      .write(`
        DELETE FROM ${TablesNames.TAGS_VALUES}
        WHERE id = :id
      `, [id])
      .commit();

    return true;
  }
}