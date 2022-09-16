import { getByRowId, getChildren } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import Serial from '../../../util/serial';
import { Topic, TopicDetails, TopicDetailsQueryResultItem } from "./interface";
import { Document } from '../../misc/document/interface';
import { Group } from "../../auth/groups/interface";
import { Category } from "../../misc/categories/interface";
import { Tag } from "../../misc/tags/interface";
import { omit } from "../../../util/pick-omit";

const TABLE_NAME = 'topics';

export default {

  // Getters
  // ----------------------------------------------------------------------------
  async getAll() {
    const result = (await oracle.exec<TopicDetailsQueryResultItem>(`

      SELECT
        T.*,
        G.ID GROUP_ID,
        C.ID CATEGORY_ID
      FROM
        TOPICS T,
        TOPIC_GROUP TG,
        GROUPS G,
        TOPIC_CATEGORY TG,
        CATEGORIES G
      WHERE
        T.ID = :a
        AND T.ID = TG.TOPIC_ID
        AND G.ID = TG.GROUP_ID
        AND T.ID = TC.TOPIC_ID
        AND C.ID = TC.CATEGORY_ID

    `)).rows || [];

    if (result.length === 0)
      return null;

    const topic = omit<TopicDetails, TopicDetailsQueryResultItem>(result[0], [
      'GROUP_ID',
      'CATEGORY_ID',
    ]);
    
    const groups = new Set<number>();
    const categories = new Set<number>();

    for (const rec of result) {
      groups.add(rec.GROUP_ID);
      categories.add(rec.CATEGORY_ID);
    }

    topic.GROUPS = Array.from(groups);
    topic.CATEGORIES = Array.from(categories);

    return topic;
  },

  async get(id: number) {
    return (await oracle.exec<Topic>(`

      SELECT *
      FROM ${TABLE_NAME}
      WHERE id = :id

    `, [id])).rows?.[0] || null;
  },

  async getBySerial(serial: string) {
    return (await oracle.exec<Topic>(`

      SELECT *
      FROM ${TABLE_NAME}
      WHERE serial = :serial

    `, [serial])).rows?.[0] || null;
  },




  // Util
  // ----------------------------------------------------------------------------
  async exists(id: number) {
    return (await oracle.exec<{ count: number }>(`

      SELECT COUNT(id) as count
      FROM ${TABLE_NAME}
      WHERE id = :id

    `, [id])).rows?.[0].count! > 0;
  },

  async nameExists(name_ar: string, name_en: string) {
    return (await oracle.exec<{ COUNT: number }>(`

      SELECT COUNT(name) as count
      FROM ${TABLE_NAME}
      WHERE name_ar = :name_ar OR name_en = :name_en

    `, [name_ar, name_en])).rows?.[0].COUNT! > 0;
  },

  async updatedNameExists(id: number, name_ar: string, name_en: string) {
    return (await oracle.exec<{ count: number }>(`

      SELECT COUNT(name) as count
      FROM ${TABLE_NAME}
      WHERE (name_ar = :name_ar OR name_en = :name_en) AND id <> :id

    `, [name_ar, name_en, id])).rows?.[0].count! > 0;
  },




  // create
  // ----------------------------------------------------------------------------
  async create(name_ar: string, name_en: string, parent?: string, desc_ar?: string, desc_en?: string) {
    if (await this.nameExists(name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const siblings = !!parent ? [] : await getChildren(TABLE_NAME, parent!);
    const serial = Serial.gen(parent, siblings);

    const result = await oracle.exec(`

      INSERT INTO ${TABLE_NAME} (serial, name_ar, name_en, desc_ar, desc_en)
      VALUES (:a, :b, :c, :d, :e)

    `, [serial, name_ar, name_en, desc_ar, desc_en]);

    return getByRowId<Topic>(TABLE_NAME, result.lastRowid!);
  },




  // update
  // ----------------------------------------------------------------------------
  async updateName(id: number, name_ar: string, name_en: string, desc_ar?: string, desc_en?: string) {
    if (await this.updatedNameExists(id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const date = Date.now();

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET (name_ar = :a, name_en = :b, desc_ar = :c, desc_en = :d update_date = :e)
      WHERE id = :f
    
    `, [name_ar, name_en, desc_ar, desc_en, date, id]);

    return date;
  },
  
  
  
  
  // category
  // ----------------------------------------------------------------------------
  async getCategories(topic_id: number) {
    return (await oracle.exec<Category>(`
    
      SELECT C.*
      FROM CATEGORIES C, TOPIC_CATEGORY TC
      WHERE TC.TOPIC_ID = :a AND C.ID = TC.CATEGORY_ID
    
    `, [topic_id])).rows || [];
  },

  async addCategory(topic_id: number, cat_id: number) {
    await oracle.exec(`
    
      INSERT INTO topic_category (topic_id, category_id)
      VALUES (:a, :b)
    
    `, [topic_id, cat_id]);

    return true;
  },

  async removeCategory(topic_id: number, cat_id: number) {
    await oracle.exec(`
    
      DELETE FROM topic_category
      WHERE topic_id = :a AND category_id = :b
    
    `, [topic_id, cat_id]);

    return true;
  },




  // tags
  // ----------------------------------------------------------------------------
  async getTags(topic_id: number) {
    return (await oracle.exec<Tag>(`
    
      SELECT
        K.ID as KEY_ID,
        V.ID as VALUE_ID,
        K.NAME_AR AS KEY_AR,
        K.NAME_EN AS KEY_EN,
        V.NAME_AR AS VALUE_AR,
        V.NAME_EN AS VALUE_EN
      FROM 
        TAGS_KEYS K,
        TAGS_VALUES V,
        TOPIC_TAG TT
      WHERE
        TT.TOPIC_ID = :a 
        AND V.ID = TT.TAG_VALUE_ID
        AND K.ID = V.TAG_KEY_ID
    
    `, [topic_id])).rows || [];
  },

  async addTag(topic_id: number, tag_value_id: number) {
    await oracle.exec(`
    
      INSERT INTO topic_tag (topic_id, tag_value_id)
      VALUES (:a, :b)
    
    `, [topic_id, tag_value_id]);

    return true;
  },

  async removeTag(topic_id: number, tag_id: number) {
    await oracle.exec(`
    
      DELETE FROM topic_tag
      WHERE topic_id = :a AND tag_id = :b
    
    `, [topic_id, tag_id]);

    return true;
  },





  // groups
  // ----------------------------------------------------------------------------------------------------------------
  async getGroups(topic_id: number) {
    return (await oracle.exec<Group>(`
    
      SELECT G.*
      FROM GROUPS G, TOPIC_GROUP TG
      WHERE TG.TOPIC_ID = :a AND G.ID = TG.GROUP_ID
    
    `, [topic_id])).rows || [];
  },


  async assignGroup(topic_id: number, group_id: number) {
    await oracle.exec(`
    
      INSERT INTO topic_group (topic_id, group_id)
      VALUES (:a, :b)

    `, [topic_id, group_id])

    return true;
  },

  async removeGroup(topic_id: number, group_id: number) {
    await oracle.exec(`
    
      DELETE FROM topic_group
      WHERE topic_id = :a, group_id = :b

    `, [topic_id, group_id])

    return true;
  },




  // documents
  // ----------------------------------------------------------------------------------------------------------------
  async getDocuments(topic_id: number) {
    return (await oracle.exec<Document>(`
    
      SELECT D.*
      FROM DOCUMENTS D, TOPIC_DOCUMENT TD
      WHERE TD.TOPIC_ID = :a AND D.ID = TD.DOCUMENT_ID
    
    `, [topic_id])).rows || [];
  },
}