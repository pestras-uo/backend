import { getChildren, TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import Serial from '../../../util/serial';
import { Topic, TopicDetails, TopicDetailsQueryResultItem } from "./interface";
import { Document } from '../../misc/document/interface';
import { Group } from "../../auth/groups/interface";
import { Category } from "../../misc/categories/interface";
import { Tag, TagMap, TagQueryResult } from "../../misc/tags/interface";
import { omit } from "../../../util/pick-omit";
import { randomUUID } from 'crypto';

export default {

  // Getters
  // ----------------------------------------------------------------------------
  async getAll() {
    return (await oracle.op().read<Topic>(`

      SELECT *
      FROM ${TablesNames.TOPICS}

    `)).rows || [];
  },

  async get(id: string) {
    const result = (await oracle.op().read<TopicDetailsQueryResultItem>(`

      SELECT
        T.*,
        TG.GROUP_ID GROUP_ID,
        TC.GROUP_ID CATEGORY_ID
      FROM
        ${TablesNames.TOPICS} T,
      LEFT JOIN
        ${TablesNames.TOPIC_GROUP} TG ON TG.TOPIC_ID = T.ID
      LEFT JOIN
        ${TablesNames.TOPIC_CATEGORY} TG ON TC.TOPIC_ID = T.ID
      WHERE
        T.ID = :a

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
    return (await oracle.op().read<{ count: number }>(`

      SELECT COUNT(id) as count
      FROM ${TablesNames.TOPICS}
      WHERE id = :id

    `, [id])).rows?.[0].count! > 0;
  },

  async nameExists(name_ar: string, name_en: string) {
    return (await oracle.op().read<{ COUNT: number }>(`

      SELECT COUNT(name) as count
      FROM ${TablesNames.TOPICS}
      WHERE name_ar = :name_ar OR name_en = :name_en

    `, [name_ar, name_en])).rows?.[0].COUNT! > 0;
  },

  async updatedNameExists(id: string, name_ar: string, name_en: string) {
    return (await oracle.op().read<{ count: number }>(`

      SELECT COUNT(name) as count
      FROM ${TablesNames.TOPICS}
      WHERE (name_ar = :name_ar OR name_en = :name_en) AND id <> :id

    `, [name_ar, name_en, id])).rows?.[0].count! > 0;
  },




  // create
  // ----------------------------------------------------------------------------
  async create(name_ar: string, name_en: string, parent?: string, desc_ar?: string, desc_en?: string, groups: string[] = [], categories: string[] = []) {
    if (await this.nameExists(name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const siblings = !!parent ? [] : await getChildren(TablesNames.TOPICS, parent!);
    const id = Serial.gen(parent, siblings);

    await oracle.op()
      .write(`

        INSERT INTO ${TablesNames.TOPICS} (id, name_ar, name_en, desc_ar, desc_en)
        VALUES (:a, :b, :c, :d, :e)

      `, [id, name_ar, name_en, desc_ar, desc_en])
      .writeMany(`
      
        INSERT INTO ${TablesNames.TOPIC_GROUP} (topic_id, group_id)
        VALUES (:a, :b)
      
      `, groups.map(g => [id, g]))
      .writeMany(`
      
        INSERT INTO ${TablesNames.TOPIC_CATEGORY} (topic_id, category_id)
        VALUES (:a, :b)
      
      `, categories.map(c => [id, c]))
      .commit();

    return this.get(id);
  },




  // update
  // ----------------------------------------------------------------------------
  async update(id: string, name_ar: string, name_en: string, desc_ar?: string, desc_en?: string) {
    if (!(await this.exists(id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'topicNotFound');

    if (await this.updatedNameExists(id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const date = new Date();

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.TOPICS}
        SET (name_ar = :a, name_en = :b, desc_ar = :c, desc_en = :d update_date = :e)
        WHERE id = :f
      
      `, [name_ar, name_en, desc_ar, desc_en, date, id])
      .commit();

    return date;
  },




  // category
  // ----------------------------------------------------------------------------
  async getCategories(topic_id: string) {
    return (await oracle.op().read<Category>(`
    
      SELECT C.*
      FROM ${TablesNames.CATEGORIES} C, ${TablesNames.TOPIC_CATEGORY} TC
      WHERE TC.TOPIC_ID = :a AND C.ID = TC.CATEGORY_ID
    
    `, [topic_id])).rows || [];
  },

  async replaceCategories(topic_id: string, categories: string[]) {
    if (!(await this.exists(topic_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'topicNotFound');

    await oracle.op()
      .write(`
      
        DELETE FROM ${TablesNames.TOPIC_CATEGORY}
        WHERE topic_id = :a
      
      `, [topic_id])
      .writeMany(`
      
        INSERT INTO ${TablesNames.TOPIC_CATEGORY} (topic_id, category_id)
        VALUES (:a, :b)
      
      `, categories.map(c => [topic_id, c]))
      .commit();

    return true;
  },




  // tags
  // ----------------------------------------------------------------------------
  async getTags(topic_id: string) {
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
      WHERE
        T.ID = :a
    
    `, [topic_id])).rows || [];

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

  async replaceTags(topic_id: string, tags: string[]) {
    if (!(await this.exists(topic_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'topicNotFound');

    await oracle.op()
      .write(`
      
        DELETE FROM ${TablesNames.TOPIC_TAG}
        WHERE topic_id = :a
      
      `, [topic_id])
      .writeMany(`
      
        INSERT INTO ${TablesNames.TOPIC_TAG} (topic_id, tag_value_id)
        VALUES (:a, :b)
      
      `, tags.map(t => [topic_id, t]))
      .commit();

    return true;
  },





  // groups
  // ----------------------------------------------------------------------------------------------------------------
  async getGroups(topic_id: string) {
    return (await oracle.op().read<Group>(`
    
      SELECT G.*
      FROM ${TablesNames.GROUPS} G, ${TablesNames.TOPIC_GROUP} TG
      WHERE TG.TOPIC_ID = :a AND G.ID = TG.GROUP_ID
    
    `, [topic_id])).rows || [];
  },

  async replaceGroups(topic_id: string, groups: string[]) {
    if (!(await this.exists(topic_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'topicNotFound');

    await oracle.op()
      .write(`
      
        DELETE FROM ${TablesNames.TOPIC_GROUP}
        WHERE topic_id = :a

      `, [topic_id])
      .writeMany(`
      
        INSERT INTO ${TablesNames.TOPIC_GROUP} (topic_id, group_id)
        VALUES (:a, :b)
      
      `, groups.map(g => [topic_id, g]))
      .commit();

    return true;
  },




  // documents
  // ----------------------------------------------------------------------------------------------------------------
  async getDocuments(topic_id: string) {
    return (await oracle.op().read<Document>(`
    
      SELECT D.*
      FROM ${TablesNames.DOCUMENTS} D, ${TablesNames.TOPIC_DOCUMENT} TD
      WHERE TD.TOPIC_ID = :a AND D.ID = TD.DOCUMENT_ID
    
    `, [topic_id])).rows || [];
  },

  async addDocument(topic_id: string, path: string, name_ar: string, name_en: string) {
    if (!(await this.exists(topic_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'topicNotFound');

    const doc_id = randomUUID();

    await oracle.op()
      .write(`

        INSERT INTO ${TablesNames.DOCUMENTS} (id, path, name_ar, name_en)
        VALUES (:a, :b, :c, :d)

      `, [doc_id, path, name_ar, name_en])
      .write(`
      
        INSERT INTO ${TablesNames.TOPIC_DOCUMENT} (topic_id, document_id)
        SET (:a, :b)
      
      `, [topic_id, doc_id])
      .commit();

    return true;
  },

  async deleteDocument(topic_id: string, doc_id: string) {
    await oracle.op()
      .write(`
      
        DELETE FROM ${TablesNames.TOPIC_DOCUMENT}
        WHERE topic_id = :a document_id = :b
      
      `, [topic_id, doc_id])
      .write(`

        DELETE FROM ${TablesNames.DOCUMENTS}
        WHERE id = :id
        
      `, [doc_id])
      .commit();

    return true;
  }
}