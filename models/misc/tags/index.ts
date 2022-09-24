import { getByRowId, TablesNames } from "../..";
import oracle from "../../../db/oracle"
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { TagQueryResult, TagKey, TagValue, Tag } from "./interface";
import { randomUUID } from 'crypto';

export default {


  // Getters
  // -------------------------------------------------------------------------------
  async getKeys() {
    return (await oracle.exec<TagKey>(`
    
      SELECT *
      FROM ${TablesNames.TAGS_KEYS}
    
    `)).rows || [];
  },

  async getValues() {
    return (await oracle.exec<TagValue>(`
    
      SELECT *
      FROM ${TablesNames.TAGS_VALUES}
    
    `)).rows || [];
  },

  async getKey(id: string) {
    return (await oracle.exec<TagKey>(`
    
      SELECT *
      FROM ${TablesNames.TAGS_KEYS}
      WHERE id = :id
    
    `, [id])).rows?.[0] || null;
  },

  async getValue(id: string) {
    return (await oracle.exec<TagValue>(`
    
      SELECT *
      FROM ${TablesNames.TAGS_VALUES}
      WHERE id = :id
    
    `, [id])).rows?.[0] || null;
  },




  // Util
  // -------------------------------------------------------------------------------
  async keyExists(id: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TablesNames.TAGS_KEYS}
      WHERE id = :a
  
  `, [id])).rows?.[0].COUNT! > 0;
  },

  async valueExists(id: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TablesNames.TAGS_VALUES}
      WHERE id = :a
  
  `, [id])).rows?.[0].COUNT! > 0;
  },

  async keyNameExists(name_ar: string, name_en: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TablesNames.TAGS_KEYS}
      WHERE name_ar = :a OR name_en = :b
    
    `, [name_ar, name_en])).rows?.[0].COUNT! > 0;
  },

  async valueNameExists(key_id: string, name_ar: string, name_en: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TablesNames.TAGS_VALUES}
      WHERE (name_ar = :a OR name_en = :b) AND tag_key_id = :c
    
    `, [name_ar, name_en, key_id])).rows?.[0].COUNT! > 0;
  },

  async updateKeyNameExists(id: string, name_ar: string, name_en: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TablesNames.TAGS_KEYS}
      WHERE (name_ar = :a OR name_en = :b) AND id <> :c
    
    `, [name_ar, name_en, id])).rows?.[0].COUNT! > 0;
  },

  async updateValueNameExists(key_id: string, value_id: string, name_ar: string, name_en: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
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
    const result = await oracle.exec(`
    
      INSERT INTO ${TablesNames.TAGS_KEYS} (id, name_ar, name_en)
      VALUES(:a, :b, :c)
    
    `, [id, name_ar, name_en]);

    return getByRowId<TagKey>(TablesNames.TAGS_KEYS, result.lastRowid!);
  },

  async createValue(key_id: string, name_ar: string, name_en: string) {
    if (await this.valueNameExists(key_id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "tagValueAlreadyExists");

    const id = randomUUID();
    const result = await oracle.exec(`
    
      INSERT INTO ${TablesNames.TAGS_VALUES} (id, taag_key_id, name_ar, name_en)
      VALUES(:a, :b, :c, :d)
    
    `, [id, key_id, name_ar, name_en]);

    return getByRowId<TagValue>(TablesNames.TAGS_KEYS, result.lastRowid!);
  },




  // update
  // -------------------------------------------------------------------------------
  async updateKey(id: string, name_ar: string, name_en: string) {
    if (await this.updateKeyNameExists(id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TablesNames.TAGS_KEYS}
      SET name_ar = :a, name_en = :b, update_date = :c
      WHERE id = :d
    
    `, [name_ar, name_en, date, id]);

    return date;
  },

  async updateValue(key_id: string, value_id: string, name_ar: string, name_en: string) {
    if (await this.updateValueNameExists(key_id, value_id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TablesNames.TAGS_VALUES}
      SET value_ar = :a, value_en = :b, update_date = :c
      WHERE id = :d AND tag_key_id = :e
    
    `, [name_ar, name_en, date, value_id, key_id]);

    return date;
  },




  // update
  // -------------------------------------------------------------------------------
  async deleteKey(id: string) {
    await oracle.exec(`
      DELETE FROM ${TablesNames.TAGS_KEYS}
      WHERE id = :id
    `, [id]);

    return true;
  },

  async deleteValue(id: string) {
    await oracle.exec(`
      DELETE FROM ${TablesNames.TAGS_VALUES}
      WHERE id = :id
    `, [id]);

    return true;
  }
}