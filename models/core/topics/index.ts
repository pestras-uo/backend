import { getByRowId, getChildren, TablesNames } from "../..";
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

export default {

  // Getters
  // ----------------------------------------------------------------------------
  async getAll() {
    return (await oracle.exec<Topic>(`

      SELECT *
      FROM ${TablesNames.TOPICS}

    `)).rows || [];
  },

  async get(id: string) {
    const result = (await oracle.exec<TopicDetailsQueryResultItem>(`

      SELECT
        T.*,
        TG.GROUP_ID GROUP_ID,
        TC.GROUP_ID CATEGORY_ID
      FROM
        ${TablesNames.TOPICS} T,
        ${TablesNames.TOPIC_GROUP} TG,
        ${TablesNames.TOPIC_CATEGORY} TG
      WHERE
        T.ID = :a
        AND T.ID = TG.TOPIC_ID
        AND T.ID = TC.TOPIC_ID

    `, [id])).rows || [];

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




  // Util
  // ----------------------------------------------------------------------------
  async exists(id: string) {
    return (await oracle.exec<{ count: number }>(`

      SELECT COUNT(id) as count
      FROM ${TablesNames.TOPICS}
      WHERE id = :id

    `, [id])).rows?.[0].count! > 0;
  },

  async nameExists(name_ar: string, name_en: string) {
    return (await oracle.exec<{ COUNT: number }>(`

      SELECT COUNT(name) as count
      FROM ${TablesNames.TOPICS}
      WHERE name_ar = :name_ar OR name_en = :name_en

    `, [name_ar, name_en])).rows?.[0].COUNT! > 0;
  },

  async updatedNameExists(id: string, name_ar: string, name_en: string) {
    return (await oracle.exec<{ count: number }>(`

      SELECT COUNT(name) as count
      FROM ${TablesNames.TOPICS}
      WHERE (name_ar = :name_ar OR name_en = :name_en) AND id <> :id

    `, [name_ar, name_en, id])).rows?.[0].count! > 0;
  },




  // create
  // ----------------------------------------------------------------------------
  async create(name_ar: string, name_en: string, parent?: string, desc_ar?: string, desc_en?: string) {
    if (await this.nameExists(name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const siblings = !!parent ? [] : await getChildren(TablesNames.TOPICS, parent!);
    const id = Serial.gen(parent, siblings);

    const result = await oracle.exec(`

      INSERT INTO ${TablesNames.TOPICS} (id, name_ar, name_en, desc_ar, desc_en)
      VALUES (:a, :b, :c, :d, :e)

    `, [id, name_ar, name_en, desc_ar, desc_en]);

    return getByRowId<Topic>(TablesNames.TOPICS, result.lastRowid!);
  },




  // update
  // ----------------------------------------------------------------------------
  async updateName(id: string, name_ar: string, name_en: string, desc_ar?: string, desc_en?: string) {
    if (await this.updatedNameExists(id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TablesNames.TOPICS}
      SET (name_ar = :a, name_en = :b, desc_ar = :c, desc_en = :d update_date = :e)
      WHERE id = :f
    
    `, [name_ar, name_en, desc_ar, desc_en, date, id]);

    return date;
  },




  // category
  // ----------------------------------------------------------------------------
  async getCategories(topic_id: string) {
    return (await oracle.exec<Category>(`
    
      SELECT C.*
      FROM ${TablesNames.CATEGORIES} C, ${TablesNames.TOPIC_CATEGORY} TC
      WHERE TC.TOPIC_ID = :a AND C.ID = TC.CATEGORY_ID
    
    `, [topic_id])).rows || [];
  },

  async addCategory(topic_id: string, cat_id: string) {
    await oracle.exec(`
    
      INSERT INTO ${TablesNames.TOPIC_CATEGORY} (topic_id, category_id)
      VALUES (:a, :b)
    
    `, [topic_id, cat_id]);

    return true;
  },

  async removeCategory(topic_id: string, cat_id: string) {
    await oracle.exec(`
    
      DELETE FROM ${TablesNames.TOPIC_CATEGORY}
      WHERE topic_id = :a AND category_id = :b
    
    `, [topic_id, cat_id]);

    return true;
  },




  // tags
  // ----------------------------------------------------------------------------
  async getTags(topic_id: string) {
    return (await oracle.exec<Tag>(`
    
      SELECT
        K.ID as KEY_ID,
        V.ID as VALUE_ID,
        K.NAME_AR AS KEY_AR,
        K.NAME_EN AS KEY_EN,
        V.NAME_AR AS VALUE_AR,
        V.NAME_EN AS VALUE_EN
      FROM 
        ${TablesNames.TAGS_KEYS} K,
        ${TablesNames.TAGS_VALUES} V,
        ${TablesNames.TOPIC_TAG} TT
      WHERE
        TT.TOPIC_ID = :a 
        AND V.ID = TT.TAG_VALUE_ID
        AND K.ID = V.TAG_KEY_ID
    
    `, [topic_id])).rows || [];
  },

  async addTag(topic_id: string, tag_value_id: string) {
    await oracle.exec(`
    
      INSERT INTO ${TablesNames.TOPIC_TAG} (topic_id, tag_value_id)
      VALUES (:a, :b)
    
    `, [topic_id, tag_value_id]);

    return true;
  },

  async removeTag(topic_id: string, tag_id: string) {
    await oracle.exec(`
    
      DELETE FROM ${TablesNames.TOPIC_TAG}
      WHERE topic_id = :a AND tag_id = :b
    
    `, [topic_id, tag_id]);

    return true;
  },





  // groups
  // ----------------------------------------------------------------------------------------------------------------
  async getGroups(topic_id: string) {
    return (await oracle.exec<Group>(`
    
      SELECT G.*
      FROM ${TablesNames.GROUPS} G, ${TablesNames.TOPIC_GROUP} TG
      WHERE TG.TOPIC_ID = :a AND G.ID = TG.GROUP_ID
    
    `, [topic_id])).rows || [];
  },


  async assignGroup(topic_id: string, group_id: string) {
    await oracle.exec(`
    
      INSERT INTO ${TablesNames.TOPIC_GROUP} (topic_id, group_id)
      VALUES (:a, :b)

    `, [topic_id, group_id])

    return true;
  },

  async removeGroup(topic_id: string, group_id: string) {
    await oracle.exec(`
    
      DELETE FROM ${TablesNames.TOPIC_GROUP}
      WHERE topic_id = :a, group_id = :b

    `, [topic_id, group_id])

    return true;
  },




  // documents
  // ----------------------------------------------------------------------------------------------------------------
  async getDocuments(topic_id: string) {
    return (await oracle.exec<Document>(`
    
      SELECT D.*
      FROM ${TablesNames.DOCUMENTS} D, ${TablesNames.TOPIC_DOCUMENT} TD
      WHERE TD.TOPIC_ID = :a AND D.ID = TD.DOCUMENT_ID
    
    `, [topic_id])).rows || [];
  }
}