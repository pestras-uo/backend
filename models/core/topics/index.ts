import { getChildren, TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import Serial from '../../../util/serial';
import { Topic, TopicDetails, TopicDetailsQueryResultItem, TopicDocument } from "./interface";
import { omit } from "../../../util/pick-omit";

export default {

  // Getters
  // ----------------------------------------------------------------------------
  async getAll() {
    return (await oracle.op().query<Topic>(`

      SELECT *
      FROM ${TablesNames.TOPICS}

    `)).rows || [];
  },

  async get(id: string) {
    const result = (await oracle.op().query<TopicDetailsQueryResultItem>(`

      SELECT
        T.id 'id, T.name_ar 'name_ar', T.name_en 'name_en', T.desc_ar 'desc_ar',
        T.desc_en 'desc_en', T.create_date 'create_date', T.update_date 'update_date'
        TG.group_id 'group_id',
        TC.category_id 'category_id'
      FROM
        ${TablesNames.TOPICS} T,
      LEFT JOIN
        ${TablesNames.TOPIC_GROUP} TG ON TG.topic_id = T.ID
      LEFT JOIN
        ${TablesNames.TOPIC_CAT} TG ON TC.topic_id = T.ID
      WHERE
        T.ID = :a

    `, [id])).rows || [];

    if (result.length === 0)
      return null;

    const topic = omit<TopicDetails, TopicDetailsQueryResultItem>(result[0], [
      'group_id',
      'category_id',
    ]);

    const groups = new Set<number>();
    const categories = new Set<number>();

    for (const rec of result) {
      groups.add(rec.group_id);
      categories.add(rec.category_id);
    }

    topic.groups = Array.from(groups);
    topic.categories = Array.from(categories);

    return topic;
  },




  // Util
  // ----------------------------------------------------------------------------
  async exists(id: string) {
    return (await oracle.op().query<{ count: number }>(`

      SELECT COUNT(id) as 'count'
      FROM ${TablesNames.TOPICS}
      WHERE id = :id

    `, [id])).rows?.[0].count! > 0;
  },




  // create
  // ----------------------------------------------------------------------------
  async create(name_ar: string, name_en: string, parent?: string, desc_ar?: string, desc_en?: string, groups: string[] = [], categories: string[] = []) {
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
      
        INSERT INTO ${TablesNames.TOPIC_CAT} (topic_id, category_id)
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
    return ((await oracle.op().query<{ category_id: string }>(`
    
      SELECT category_id 'category_id'
      FROM ${TablesNames.TOPIC_CAT}
      WHERE topic_id = :a
    
    `, [topic_id])).rows || []).map(r => r.category_id);
  },

  async replaceCategories(topic_id: string, categories: string[]) {
    if (!(await this.exists(topic_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'topicNotFound');

    await oracle.op()
      .write(`
      
        DELETE FROM ${TablesNames.TOPIC_CAT}
        WHERE topic_id = :a
      
      `, [topic_id])
      .writeMany(`
      
        INSERT INTO ${TablesNames.TOPIC_CAT} (topic_id, category_id)
        VALUES (:a, :b)
      
      `, categories.map(c => [topic_id, c]))
      .commit();

    return true;
  },





  // groups
  // ----------------------------------------------------------------------------------------------------------------
  async getGroups(topic_id: string) {
    return ((await oracle.op().query<{ group_id: string }>(`
    
      SELECT group_id 'group_id'
      FROM ${TablesNames.TOPIC_GROUP}
      WHERE topic_id = :a
    
    `, [topic_id])).rows || []).map(r => r.group_id);
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
    return (await oracle.op().query<TopicDocument>(`
    
      SELECT 
        topic_id 'topic_id,
        path 'path',
        name_ar 'name_ar',
        name_en 'name_en',
        upload_date 'upload_date'
      FROM ${TablesNames.TOPIC_DOC}
      WHERE topic_id = :a
    
    `, [topic_id])).rows || [];
  },

  async addDocument(topic_id: string, path: string, name_ar: string, name_en: string) {
    if (!(await this.exists(topic_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'topicNotFound');

    await oracle.op()
      .write(`
      
        INSERT INTO ${TablesNames.TOPIC_DOC} (topic_id, document_id, path, name_ar, name_en)
        SET (:a, :b, :c, :d)
      
      `, [topic_id, path, name_ar, name_en])
      .commit();

    return true;
  },

  async deleteDocument(path: string) {
    await oracle.op()
      .write(`
      
        DELETE FROM ${TablesNames.TOPIC_DOC}
        WHERE path = :b
      
      `, [path])
      .commit();

    return true;
  }
}