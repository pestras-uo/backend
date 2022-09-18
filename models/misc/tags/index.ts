import { getByRowId } from "../..";
import oracle from "../../../db/oracle"
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { TagKey, TagValue } from "./interface";
import { randomUUID } from 'crypto';

const TAGS_KEYS_TABLE_NAME = 'tags_keys';
const TAGS_VALUES_TABLE_NAME = 'tags_values';

export default {


  // Getters
  // -------------------------------------------------------------------------------
  async getKeys() {
    return (await oracle.exec<TagKey>(`
    
      SELECT *
      FROM ${TAGS_KEYS_TABLE_NAME}
    
    `)).rows || [];
  },

  async getValues() {
    return (await oracle.exec<TagValue>(`
    
      SELECT *
      FROM ${TAGS_VALUES_TABLE_NAME}
    
    `)).rows || [];
  },

  async getKey(id: string) {
    return (await oracle.exec<TagKey>(`
    
      SELECT *
      FROM ${TAGS_KEYS_TABLE_NAME}
      WHERE id = :id
    
    `, [id])).rows?.[0] || null;
  },

  async getValue(id: string) {
    return (await oracle.exec<TagValue>(`
    
      SELECT *
      FROM ${TAGS_VALUES_TABLE_NAME}
      WHERE id = :id
    
    `, [id])).rows?.[0] || null;
  },




  // Util
  // -------------------------------------------------------------------------------
  async keysExists(name_ar: string, name_en: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TAGS_KEYS_TABLE_NAME}
      WHERE name_ar = :a OR name_en = :b
    
    `, [name_ar, name_en])).rows?.[0].COUNT! > 0;
  },

  async valueExists(key_id: string, name_ar: string, name_en: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TAGS_VALUES_TABLE_NAME}
      WHERE (name_ar = :a OR name_en = :b) AND tag_key_id = :c
    
    `, [name_ar, name_en, key_id])).rows?.[0].COUNT! > 0;
  },

  async updateKeyExists(id: string, name_ar: string, name_en: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TAGS_KEYS_TABLE_NAME}
      WHERE (name_ar = :a OR name_en = :b) AND id <> :c
    
    `, [name_ar, name_en, id])).rows?.[0].COUNT! > 0;
  },

  async updateValueExists(key_id: string, value_id: string, name_ar: string, name_en: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TAGS_VALUES_TABLE_NAME}
      WHERE (name_ar = :a OR name_en = :b) AND tag_key_id = :c AND id <> :d
    
    `, [name_ar, name_en, key_id, value_id])).rows?.[0].COUNT! > 0;
  },




  // create
  // -------------------------------------------------------------------------------
  async createKey(name_ar: string, name_en: string) {
    if (await this.keysExists(name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "tagKeyAlreadyExists");

    const id = randomUUID();
    const result = await oracle.exec(`
    
      INSERT INTO ${TAGS_KEYS_TABLE_NAME} (id, name_ar, name_en)
      VALUES(:a, :b, :c)
    
    `, [id, name_ar, name_en]);

    return getByRowId<TagKey>(TAGS_KEYS_TABLE_NAME, result.lastRowid!);
  },

  async createValue(key_id: string, name_ar: string, name_en: string) {
    if (await this.valueExists(key_id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "tagValueAlreadyExists");

    const id = randomUUID();
    const result = await oracle.exec(`
    
      INSERT INTO ${TAGS_VALUES_TABLE_NAME} (id, taag_key_id, name_ar, name_en)
      VALUES(:a, :b, :c, :d)
    
    `, [id, key_id, name_ar, name_en]);

    return getByRowId<TagKey>(TAGS_KEYS_TABLE_NAME, result.lastRowid!);
  },




  // update
  // -------------------------------------------------------------------------------
  async updateKeys(id: string, name_ar: string, name_en: string) {
    if (await this.updateKeyExists(id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TAGS_KEYS_TABLE_NAME}
      SET name_ar = :a, name_en = :b, update_date = :c
      WHERE id = :d
    
    `, [name_ar, name_en, date, id]);

    return date;
  },

  async updateValues(key_id: string, value_id: string, name_ar: string, name_en: string) {
    if (await this.updateValueExists(key_id, value_id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TAGS_VALUES_TABLE_NAME}
      SET value_ar = :a, value_en = :b, update_date = :c
      WHERE id = :d AND tag_key_id = :e
    
    `, [name_ar, name_en, date, value_id, key_id]);

    return date;
  },




  // update
  // -------------------------------------------------------------------------------
  async deleteKey(id: string) {
    await oracle.exec(`
      DELETE FROM ${TAGS_KEYS_TABLE_NAME}
      WHERE id = :id
    `, [id]);

    return true;
  },

  async deleteValue(id: string) {
    await oracle.exec(`
      DELETE FROM ${TAGS_VALUES_TABLE_NAME}
      WHERE id = :id
    `, [id]);

    return true;
  }
}