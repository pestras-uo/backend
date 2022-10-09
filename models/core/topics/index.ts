import { getChildren, TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import Serial from '../../../util/serial';
import { DBTopic, Topic, TopicDocument } from "./interface";
import { omit } from "../../../util/pick-omit";

export default {

  // Getters
  // ----------------------------------------------------------------------------
  async getAll() {
    const result = (await oracle.op().query<DBTopic & { category_id: string }>(`

      SELECT
        id "id",
        name_ar "name_ar",
        name_en "name_en",
        desc_ar "desc_ar",
        desc_en "desc_en",
        categories "categories",
        create_date "create_date",
        create_by "create_by",
        update_date "update_date",
        update_by "update_by"
      FROM
        ${TablesNames.TOPICS}

    `)).rows || [];

    return result
      .map(t => ({ ...omit(t, ['categories']), categories: JSON.parse(t.categories) } as Topic));
  },

  async get(id: string) {
    const result = (await oracle.op().query<DBTopic & { category_id: string}>(`

      SELECT
        id "id",
        name_ar "name_ar",
        name_en "name_en",
        desc_ar "desc_ar",
        desc_en "desc_en",
        categories "categories",
        create_date "create_date",
        create_by "create_by",
        update_date "update_date",
        update_by "update_by"
      FROM
        ${TablesNames.TOPICS}
      WHERE
        id = :a

    `, [id])).rows[0] || null;

    return result
      ? { ...omit(result, ['categories']), categories: JSON.parse(result.categories) } as Topic
      : null;
  },




  // Util
  // ----------------------------------------------------------------------------
  async exists(id: string) {
    return (await oracle.op().query<{ count: number }>(`

      SELECT COUNT(id) as "count"
      FROM ${TablesNames.TOPICS}
      WHERE id = :id

    `, [id])).rows?.[0].count! > 0;
  },




  // create
  // ----------------------------------------------------------------------------
  async create(topic: Omit<Topic, 'id' | 'create_date' | 'create_by'>, parent_id: string, issuer_id: string) {
    const id = Serial.gen(parent_id, !!parent_id ? [] : await getChildren(TablesNames.TOPICS, parent_id!));

    await oracle.op()
      .write(`

        INSERT INTO ${TablesNames.TOPICS} (
          id, 
          name_ar, 
          name_en, 
          desc_ar, 
          desc_en, 
          categories,
          create_by
        )
        VALUES (:a, :b, :c, :d, :e, :f, :g)

      `, [
        id,
        topic.name_ar, 
        topic.name_en, 
        topic.desc_ar, 
        topic.desc_en, 
        JSON.stringify(topic.categories),
        issuer_id
      ])
      .commit();

    return this.get(id);
  },




  // update
  // ----------------------------------------------------------------------------
  async update(id: string, name_ar: string, name_en: string, desc_ar: string, desc_en: string, issuer_id: string) {
    if (!(await this.exists(id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'topicNotFound');

    const date = new Date();

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.TOPICS}
        SET 
          name_ar = :a, 
          name_en = :b, 
          desc_ar = :c, 
          desc_en = :d ,
          update_date = :e,
          update_by = :f
        WHERE id = :g
      
      `, [name_ar, name_en, desc_ar, desc_en, date, issuer_id, id])
      .commit();

    return date;
  },




  // category
  // ----------------------------------------------------------------------------
  async updateCategories(topic_id: string, categories: string[], issuer_id: string) {
    if (!(await this.exists(topic_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'topicNotFound');

    const date = new Date();

    await oracle.op()
      .writeMany(`
      
        UPDATE ${TablesNames.TOPICS}
        SET categories = :a, update_date = :b, update_by = :c
        WHERE id = :d
      
      `, [JSON.stringify(categories), date, issuer_id, topic_id])
      .commit();

    return date;
  },




  // documents
  // ----------------------------------------------------------------------------------------------------------------
  async getDocuments(topic_id: string) {
    return (await oracle.op().query<TopicDocument>(`
    
      SELECT 
        topic_id "topic_id",
        path "path",
        name_ar "name_ar",
        name_en "name_en",
        upload_date "upload_date"
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