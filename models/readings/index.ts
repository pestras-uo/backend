import oracle, { DBSchemas } from "../../db/oracle";
import { HttpError } from "../../misc/errors";
import { HttpCode } from "../../misc/http-codes";
import { IndicatorReading, ReadingDocument, ReadingHistoryItem } from "./interface";
import { randomUUID } from 'crypto';
import indicatorConfig from "../indicators/indicator-config";
import { TablesNames } from "..";

async function getIndicator(ind_id: string) {
  const indicator = await indicatorConfig.get(ind_id);

  if (!indicator)
    throw new HttpError(HttpCode.NOT_FOUND, 'indicatorNotFound');

  return indicator;
}

export default {

  // getters
  // --------------------------------------------------------------------------------------
  async get(ind_id: string, offset = 0, limit = 100) {
    const readingTableName = (await getIndicator(ind_id)).READINGS_VIEW || ind_id;

    return (await oracle.op(DBSchemas.READINGS).query<IndicatorReading>(`
    
      SELECT *
      FROM ${readingTableName}
      OFFSET :b ROWS
      FETCH NEXT :c ROWS ONLY
    
    `, [ind_id, offset, limit])).rows || []
  },

  async getById(ind_id: string, id: string) {
    const readingTableName = (await getIndicator(ind_id)).READINGS_VIEW || ind_id;

    return (await oracle.op(DBSchemas.READINGS).query<IndicatorReading>(`
    
      SELECT *
      FROM ${readingTableName}
      WHERE id = :a
    
    `, [id])).rows?.[0] || null;
  },




  // util
  // --------------------------------------------------------------------------------------
  async exists(ind_id: string, id: string) {
    const readingTableName = (await getIndicator(ind_id)).READINGS_VIEW || ind_id;

    return (await oracle.op(DBSchemas.READINGS).query<{ COUNT: number }>(`
    
      SELECT COUNT(*) AS COUNT
      FROM ${readingTableName}
      WHERE id = :a
    
    `, [id])).rows?.[0].COUNT! > 0;
  },





  // Create
  // --------------------------------------------------------------------------------------
  async create(ind_id: string, reading: Partial<IndicatorReading>) {
    const indicator = await getIndicator(ind_id);

    if (indicator.EQUATION || indicator.READINGS_VIEW)
      throw new HttpError(HttpCode.BAD_REQUEST, 'indicatorIsAutoComputed');

    const id = randomUUID();

    await oracle.op(DBSchemas.READINGS)
      .write(`
      
        INSERT INTO ${ind_id} (id, value, reading_date, note_ar, note_en)
        VALUES (:a, :b, :c, :d)
      
      `, [id, reading.VALUE, reading.READING_DATE])
      .commit();

    return this.getById(ind_id, id);
  },




  // update value
  // --------------------------------------------------------------------------------------
  async update(ind_id: string, id: string, update: Partial<IndicatorReading>) {
    const indicator = await getIndicator(ind_id);

    if (indicator.EQUATION || indicator.READINGS_VIEW)
      throw new HttpError(HttpCode.BAD_REQUEST, 'indicatorIsAutoComputed');

    const reading = await this.getById(ind_id, id);
    const date = new Date();

    if (!reading)
      throw new HttpError(HttpCode.NOT_FOUND, "readingNotFound");

    const history: ReadingHistoryItem[] = reading.HISTORY ? JSON.parse(reading.HISTORY) : [];

    history.push({
      VALUE: reading.VALUE,
      NOTE_AR: reading.NOTE_AR,
      NOTE_EN: reading.NOTE_EN,
      READING_DATE: reading.READING_DATE.toISOString(),
      UPDATE_DATE: reading.UPDATE_DATE
        ? reading.UPDATE_DATE.toISOString()
        : reading.CREATE_DATE.toISOString()
    });

    await oracle.op(DBSchemas.READINGS)
      .write(`
      
        UPDATE ${ind_id}
        SET value = :a, note_ar = :b, note_en = :c, reading_date = :d, update_date = :e, history = :f
        WHERE id = :g
      
      `, [
        update.VALUE,
        update.NOTE_AR,
        update.NOTE_EN,
        update.READING_DATE,
        date,
        JSON.stringify(history),
        id
      ])
      .commit();

    return date;
  },




  // approve
  // --------------------------------------------------------------------------------------
  async approve(ind_id: string, id: string, state = 1) {
    const indicator = await getIndicator(ind_id);

    if (indicator.READINGS_VIEW)
      throw new HttpError(HttpCode.BAD_REQUEST, 'indicatorIsAutoApproved');

    const date = new Date();

    await oracle.op(DBSchemas.READINGS)
      .write(`

        UPDATE ${ind_id}
        SET is_approved = :a, approve_date = :b
        WHERE id = :c
      
      `, [state, state ? date : null, id])
      .commit();

    return date;
  },




  // delete
  // --------------------------------------------------------------------------------------
  async delete(ind_id: string, id: string) {
    const indicator = await getIndicator(ind_id);

    if (indicator.EQUATION || indicator.READINGS_VIEW)
      throw new HttpError(HttpCode.BAD_REQUEST, 'indicatorIsAutoComputed');

    await oracle.op(DBSchemas.READINGS)
      .write(`
      
        DELETE FROM ${ind_id}
        WHERE id = :a

      `, [id])
      .commit();

    return true;
  },




  // categories
  // ----------------------------------------------------------------------------------------------------------------
  async getCategories(id: string) {
    return ((await oracle.op(DBSchemas.READINGS).query<{ CATEGORY_ID: string }>(`
    
      SELECT category_id
      FROM ${TablesNames.READING_CATEGORY}
      WHERE READING_ID = :a
    
    `, [id])).rows || []).map(r => r.CATEGORY_ID);
  },

  async replaceCategories(ind_id: string, id: string, categories: string[]) {
    if (!(await this.exists(ind_id, id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'readingNotFound');

    await oracle.op(DBSchemas.READINGS)
      .write(`
      
        DELETE FROM ${TablesNames.READING_CATEGORY}
        WHERE reading_id = :a
      
      `, [id])
      .writeMany(`
      
        INSERT INTO ${TablesNames.READING_CATEGORY} (reading_id, category_id)
        VALUES (:a, :b)
      
      `, categories.map(c => [id, c]))
      .commit();

    return true;
  },




  // documents
  // ----------------------------------------------------------------------------------------------------------------
  async getDocuments(ind_id: string, id: string) {
    return (await oracle.op(DBSchemas.READINGS).query<ReadingDocument>(`
    
      SELECT D.*
      FROM ${TablesNames.READING_DOCUMENT}
      WHERE indicator_id = :a AND reading_id = :b
    
    `, [ind_id, id])).rows || [];
  },

  async addDocument(ind_id: string, id: string, path: string, name_ar: string, name_en: string) {
    if (!(await this.exists(ind_id, id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'readingNotFound');

    await oracle.op(DBSchemas.READINGS)
      .write(`
      
        INSERT INTO ${TablesNames.READING_DOCUMENT} (indicator_id, reading_id, path, name_ar, name_en)
        SET (:a, :b, :c, :d, :e)
      
      `, [ind_id, id, path, name_ar, name_en])
      .commit();

    return true;
  },

  async deleteDocument(path: string) {
    await oracle.op(DBSchemas.READINGS)
      .write(`
      
        DELETE FROM ${TablesNames.READING_DOCUMENT}
        WHERE path = :a
      
      `, [path])
      .commit();

    return true;
  }

}