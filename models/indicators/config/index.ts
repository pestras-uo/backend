import { TablesNames } from "models/";
import oracle, { DBSchemas } from "db/oracle"
import { HttpError } from "misc/errors";
import { HttpCode } from "misc/http-codes";
import { IndicatorConfig, IndicatorInterval, IndicatorType } from "./interface";

export default {

  // getters
  // ----------------------------------------------------------------------
  async get(id: string) {
    return (await oracle.op().query<IndicatorConfig>(`
    
      SELECT *
      FROM ${TablesNames.INDICATOR_CONFIG}
      WHERE indicator_id = :a
    
    `, [id])).rows?.[0] || null;
  },




  // util
  // ----------------------------------------------------------------------
  async exists(id: string) {
    return (await oracle.op().query<{ COUNT: number }>(`
    
    SELECT COUNT(*) AS COUNT
    FROM ${TablesNames.INDICATOR_CONFIG}
    WHERE indicator_id = :a
  
  `, [id])).rows?.[0].COUNT! > 0;
  },




  // create
  // ----------------------------------------------------------------------
  async create(id: string, config: Partial<IndicatorConfig>) {

    if (await this.exists(id))
      throw new HttpError(HttpCode.CONFLICT, "indicatorConfigAlreadyExists");

    oracle.op()
      .write(`
      
        INSERT INTO ${TablesNames.INDICATOR_CONFIG} (
          indicator_id,
          type,
          intervals,
          evaluation_day,
          kpi_min,
          kpi_max
        ) VALUES (:a, :b, :c, :d, :e, :f, :g, :h)
      
      `, [
        id,
        config.TYPE || IndicatorType.MANUAL,
        config.INTERVALS || IndicatorInterval.ANNUAL,
        config.EVALUATION_DAY || 1,
        config.KPI_MIN || null,
        config.KPI_MAX || null
      ])
      .commit();

    if (config.TYPE === IndicatorType.MANUAL)
      await oracle.op(DBSchemas.READINGS)
        .write(`
        
          CREATE TABLE ${config.INDICATOR_ID} (
            id NVARCHAR(36) CONSTRAINT ${config.INDICATOR_ID}_pk PRIMARY KEY,

            reading_value Number NOT NULL,

            note_ar NVARCHAR(128),
            note_en NVARCHAR(128),
  
            is_approved NUMBER DEFAULT 0,
            approve_date DATE,
  
            create_date DATE DEFAULT SYSDATE,
            update_date DATE,
            reading_date DATE NOT NULL,
  
            history NVARCHAR(1024)
          )
        
        `)
        .commit();

    return config;
  },




  // update
  // ---------------------------------------------------------------------------
  async update(id: string, config: Partial<IndicatorConfig>) {
    if (!(await this.exists(id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'indicatorConfigNotFound');

    await oracle.op()
      .write(`
    
        UPDATE ${TablesNames.INDICATOR_CONFIG}
        SET interval = :a, evaluation_day = :a, kpi_min = :a, kpi_max = :b
        WHERE indicator_id = :b
    
      `, [
        config.INTERVALS || IndicatorInterval.ANNUAL,
        config.EVALUATION_DAY || 1,
        config.KPI_MIN,
        config.KPI_MAX,
        id
      ])
      .commit();

    return true;
  },

  async updateState(id: string, state: 0 | 1) {
    if (!(await this.exists(id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'indicatorConfigNotFound');

    await oracle.op()
      .write(`
    
        UPDATE ${TablesNames.INDICATOR_CONFIG}
        SET state = :a
        WHERE indicator_id = :b
    
      `, [
        state,
        id
      ])
      .commit();

    return true;
  }
}