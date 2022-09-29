import { TablesNames } from "../..";
import oracle, { DBSchemas } from "../../../db/oracle"
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { IndicatorArgument, IndicatorConfig } from "./interface";

export default {

  // getters
  // ----------------------------------------------------------------------
  async get(ind_id: string) {
    return (await oracle.op().query<IndicatorConfig>(`
    
      SELECT *
      FROM ${TablesNames.INDICATOR_CONFIG}
      WHERE indicator_id = :a
    
    `, [ind_id])).rows?.[0] || null;
  },




  // util
  // ----------------------------------------------------------------------
  async exists(ind_id: string) {
    return (await oracle.op().query<{ COUNT: number }>(`
    
    SELECT COUNT(*) AS COUNT
    FROM ${TablesNames.INDICATOR_CONFIG}
    WHERE indicator_id = :a
  
  `, [ind_id])).rows?.[0].COUNT! > 0;
  },




  // create
  // ----------------------------------------------------------------------
  async create(config: Partial<IndicatorConfig>, args: { id: string, variable: string }[]) {
    /**
     * if equation is provided
     * set quatitative columns to 'value' and
     * remove make sure that readings view name is null
     */
    if (config.EQUATION) {
      config.READINGS_VIEW = null;
      config.VALUES_COLUMNS = null;
    }

    if (await this.exists(config.INDICATOR_ID))
      throw new HttpError(HttpCode.CONFLICT, "indicatorConfigAlreadyExists");

    const op = oracle.op();

    op
      .write(`
      
        INSERT INTO ${TablesNames.INDICATOR_CONFIG} (
          indicator_id,
          intervals,
          kpi_min,
          kpi_max,
          readings_view,
          values_columns,
          equation,
          evaluation_day
        ) VALUES (
          :a, :b, :c, :d, :e, :f, :g, :h
        )
      
      `, [
        config.INDICATOR_ID,
        config.INTERVALS,
        config.KPI_MIN || null,
        config.KPI_MAX || null,
        config.READINGS_VIEW,
        config.VALUES_COLUMNS,
        config.EQUATION,
        config.EVALUATION_DAY
      ]);


    if (config.EQUATION && args.length > 0)
      op
        .writeMany(`
      
          INSERT INTO ${TablesNames.INDICATOR_ARGUMENT} (indicator_id, argument_id, variable)
          VALUES (:a, :b, :c)
        
        `, args.map(arg => [config.INDICATOR_ID, arg.id, arg.variable]));

    await op.commit();

    if (!config.READINGS_VIEW)
      await oracle.op(DBSchemas.READINGS)
        .write(`
        
          CREATE TABLE ${config.INDICATOR_ID} (
            id NVARCHAR(36) CONSTRAINT ${config.INDICATOR_ID}_pk PRIMARY KEY,

            value Number NOT NULL,

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
  async updateIntervals(ind_id: string, intervals: number) {
    if (!(await this.exists(ind_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'indicatorConfigNotFound');

    const date = new Date();

    await oracle.op()
      .write(`
    
        UPDATE ${TablesNames.INDICATOR_CONFIG}
        SET interval = :a, update_date = :b
        WHERE id = :c
    
    `, [intervals, date, ind_id])
      .commit();

    return date;
  },

  async updateKpi(ind_id: string, min?: number, max?: number) {
    if (!(await this.exists(ind_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'indicatorConfigNotFound');

    const date = new Date();

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.INDICATOR_CONFIG}
        SET kpi_min = :a, kpi_max = :b, update_date = :c
        WHERE id = :d
      
      `, [min || null, max || null, date, ind_id])
      .commit();

    return date;
  },

  async updateEquation(ind_id: string, eq: string, args: { id: string; variable: string }[] = []) {
    if (!(await this.exists(ind_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'indicatorConfigNotFound');

    const op = oracle.op();

    op
      .write(`
          
        DELETE FROM ${TablesNames.INDICATOR_ARGUMENT}
        WHERE indicator_id = :a
      
      `, [ind_id])
      .write(`
      
        UPDATE ${TablesNames.INDICATOR_CONFIG}
        SET equation = :a
        WHERE id = :b
      
      `, [eq, ind_id]);

    if (args.length > 0)
      op
        .writeMany(`
        
          INSERT INTO ${TablesNames.INDICATOR_ARGUMENT} (indicator_id, argument_id, variable)
          VALUES (:a, :b, :c)
        
        `, args.map(arg => [ind_id, arg.id, arg.variable]));

    await op.commit();

    return true;
  },

  async updateEvaluationtionDay(ind_id: string, day: number) {
    if (!(await this.exists(ind_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'indicatorConfigNotFound');

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.INDICATOR_CONFIG}
        SET evaluation_day = :a
        WHERE indicator_id = :b
      
      `, [day, ind_id])
      .commit();

    return true;
  },

  // TODO
  async updateReadingView(ind_id: string, view: string, columns: string) {
    if (!(await this.exists(ind_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'indicatorConfigNotFound');


    // BEGIN
    //    EXECUTE IMMEDIATE 'DROP TABLE sales';
    // EXCEPTION
    //    WHEN OTHERS THEN NULL;
    // END;
    return true;
  },




  // arguments
  // -----------------------------------------------------------------------------------
  async getArguments(indicator_id: string) {
    return (await oracle.op().query<IndicatorArgument>(`
    
      SELECT *
      FROM
        ${TablesNames.INDICATOR_ARGUMENT}
      WHERE
        INDICATOR_ID = :a
  
    `, [indicator_id])).rows || [];
  }
}