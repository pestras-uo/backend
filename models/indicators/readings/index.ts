import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { IndicatorReading, ReadingHistoryItem } from "./interface";
import { randomUUID } from 'crypto';

const TABLE = 'indicators_readings';

export default {

  // getters
  // --------------------------------------------------------------------------------------
  async getByIndicator(indicator_id: string, offset = 0, limit = 100) {
    return (await oracle.op().read<IndicatorReading>(`
    
      SELECT *
      FROM ${TABLE}
      WHERE indicator_id = :a
      OFFSET :b ROWS
      FETCH NEXT :c ROWS ONLY
    
    `, [indicator_id, offset, limit])).rows || []
  },

  async get(id: string) {
    return (await oracle.op().read<IndicatorReading>(`
    
      SELECT *
      FROM ${TABLE}
      WHERE id = :a
    
    `, [id])).rows?.[0] || null;
  },



  
  // Create
  // --------------------------------------------------------------------------------------
  async create(ind_id: string, dis_id: string, value: number, date: Date, note_ar = "", note_en = "") {
    const id = randomUUID();

    await oracle.op()
      .write(`
      
        INSERT INTO ${TABLE} (id, indicator_id, district_id, value, note_ar, note_en, reading_date)
        VALUES (:a, :b, :c, :d, :e, :f, :g)
      
      `, [id, ind_id, dis_id, value, note_ar, note_en, date])
      .commit();

    return this.get(id);
  },



  
  // update value
  // --------------------------------------------------------------------------------------
  async updateValue(id: string, value: number, reading_date: Date, note_ar = "", note_en = "") {
    const reading = await this.get(id);
    const date = new Date();

    if (!reading)
      throw new HttpError(HttpCode.NOT_FOUND, "readingNotFound");

    const history: ReadingHistoryItem[] = reading.HISTORY ? JSON.parse(reading.HISTORY) : [];

    history.push({ 
      VALUE: reading.VALUE,
      NOTE_AR: note_ar,
      NOTE_EN: note_en,
      READING_DATE: reading_date.toISOString(),
      UPDATE_DATE: reading.UPDATE_DATE
        ? reading.UPDATE_DATE.toISOString() 
        : reading.CREATE_DATE.toISOString()
    });

    await oracle.op()
      .write(`
      
        UPDATE ${TABLE}
        SET value = :a, note_ar = :b, note_en = :c, reading_date = :d, update_date = :e, history = :f
        WHERE id = :g
      
      `, [value, note_ar, note_en, reading_date, date, JSON.stringify(history), id])
      .commit();

    return date;
  },



  
  // approve
  // --------------------------------------------------------------------------------------
  async approve(id: string, state = 1) {
    const date = new Date();

    await oracle.op()
      .write(`

        UPDATE ${TABLE}
        SET is_approved = :a, approve_date = :b
        WHERE id = :c
      
      `, [state, state ? date : null, id])
      .commit();

    return date;
  },



  
  // delete
  // --------------------------------------------------------------------------------------
  async delete(id: string) {
    await oracle.op()
      .write(`
      
        DELETE FROM ${TABLE}
        WHERE id = :a

      `, [id])
      .commit();

    return true;
  },




  // documents
  // ----------------------------------------------------------------------------------------------------------------
  async getDocuments(reading_id: string) {
    return (await oracle.op().read<Document>(`
    
      SELECT D.*
      FROM DOCUMENTS D, READING_DOCUMENT RD
      WHERE RD.READING_ID = :a AND D.ID = RD.DOCUMENT_ID
    
    `, [reading_id])).rows || [];
  }

}