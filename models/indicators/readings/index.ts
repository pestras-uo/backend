import { getByRowId } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { IndicatorReading, ReadingHistoryItem } from "./interface";

const TABLE = 'indicators_readings';

export default {

  // getters
  // --------------------------------------------------------------------------------------
  async getByTopic(indicator_id: number, offset = 0, limit = 100) {
    return (await oracle.exec<IndicatorReading>(`
    
      SELECT *
      FROM ${TABLE}
      WHERE indicator_id = :a
      OFFSET :b ROWS
      FETCH NEXT :c ROWS ONLY
    
    `, [indicator_id, offset, limit])).rows || []
  },

  async get(id: number) {
    return (await oracle.exec<IndicatorReading>(`
    
      SELECT *
      FROM ${TABLE}
      WHERE id = :a
    
    `, [id])).rows?.[0] || null;
  },



  
  // Create
  // --------------------------------------------------------------------------------------
  async create(ind_id: number, dis_id: number, value: number, date: Date, note_ar = "", note_en = "") {

    const result = await oracle.exec(`
    
      INSERT INTO ${TABLE} (indicator_id, district_id, value, note_ar, note_en, reading_date)
      VALUES (:a, :b, :c, :d, :e, :f)
    
    `, [ind_id, dis_id, value, note_ar, note_en, date]);

    return getByRowId(TABLE, result.lastRowid!);

  },



  
  // update value
  // --------------------------------------------------------------------------------------
  async updateValue(id: number, value: number, reading_date: Date, note_ar = "", note_en = "") {
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

    await oracle.exec(`
    
      UPDATE ${TABLE}
      SET value = :a, note_ar = :b, note_en = :c, reading_date = :d, update_date = :e, history = :f
      WHERE id = :g
    
    `, [value, note_ar, note_en, reading_date, date, JSON.stringify(history), id]);

    return date;
  },



  
  // approve
  // --------------------------------------------------------------------------------------
  async approve(id: number, state = 1) {
    const date = new Date();

    await oracle.exec(`

      UPDATE ${TABLE}
      SET is_approved = :a, approve_date = :b
      WHERE id = :c
    
    `, [state, state ? date : null, id]);

    return date;
  },



  
  // delete
  // --------------------------------------------------------------------------------------
  async delete(id: number) {
    await oracle.exec(`
    
      DELETE FROM ${TABLE}
      WHERE id = :a

    `, [id]);

    return true;
  }

}