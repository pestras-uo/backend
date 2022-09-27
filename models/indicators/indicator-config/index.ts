import { TablesNames } from "../..";
import oracle, { DBSchemas } from "../../../db/oracle"
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { IndicatorConfig } from "./interface";

export default {

  // getters
  // ----------------------------------------------------------------------
  async get(ind_id: string) {
    return (await oracle.op().read<IndicatorConfig>(`
    
      SELECT *
      FROM ${TablesNames.INDICATOR_CONFIG}
      WHERE indicator_id = :a
    
    `, [ind_id])).rows?.[0] || null;
  },




  // util
  // ----------------------------------------------------------------------
  async exists(ind_id: string) {
    return (await oracle.op().read<{ COUNT: number }>(`
    
    SELECT COUNT(*) AS COUNT
    FROM ${TablesNames.INDICATOR_CONFIG}
    WHERE indicator_id = :a
  
  `, [ind_id])).rows?.[0].COUNT! > 0;
  },




  // create
  // ----------------------------------------------------------------------
  async create(config: IndicatorConfig, args: { id: string, variable: string, column: string }[]) {
    /**
     * if equation is provided
     * set quatitative columns to 'value' and
     * remove make sure that readings view name is null
     */
    if (config.EQUATION) {
      config.QANTITATIVE_COLUMNS = 'value';
      config.READINGS_VIEW_NAME = null;

    } else if (config.QANTITATIVE_COLUMNS.split(',').length === 0)
      throw new HttpError(HttpCode.BAD_REQUEST, "quantitativeColumnsAreRequired");

    if (!config.READINGS_VIEW_NAME)
      config.READING_DATE_COLUMN = 'reading_date';

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
          quantitative_columns,
          readings_view_name,
          reading_date_column,
          equation
        ) VALUES (
          :a, :b, :c, :d, :e, :f, :g, :h
        )
      
      `, [
        config.INDICATOR_ID,
        config.INTERVALS,
        config.KPI_MIN || null,
        config.KPI_MAX || null,
        config.QANTITATIVE_COLUMNS,
        config.READINGS_VIEW_NAME,
        config.READING_DATE_COLUMN,
        config.EQUATION
      ]);


    if (config.EQUATION && args.length > 0)
      op
        .writeMany(`
      
          INSERT INTO ${TablesNames.INDICATOR_ARGUMENT} (indicator_id, arg_id, variable, column_name)
          VALUES (:a, :b, :c, :d)
        
        `, args.map(arg => [config.INDICATOR_ID, arg.id, arg.variable, arg.column]));

    await op.commit();

    if (!config.READINGS_VIEW_NAME)
      await oracle.op(DBSchemas.READINGS)
        .write(`
        
          CREATE TABLE ${config.INDICATOR_ID} (
            id NVARCHAR(36) CONSTRAINT ${config.INDICATOR_ID}_pk PRIMARY KEY,
            district_id NUMBER NOT NULL,
            note_ar NVARCHAR(128),
            note_en NVARCHAR(128),
  
            is_approved NUMBER DEFAULT 0,
            approve_date DATE,
  
            create_date DATE DEFAULT SYSDATE,
            update_date DATE,
            reading_date DATE NOT NULL,
  
            history NVARCHAR(1024),
  
            ${config.QANTITATIVE_COLUMNS.split(',').map(c => c.trim() + ' Number NOT NULL').join(',')}
          )
        
        `)
        .commit();
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

  async updateEquation(ind_id: string, eq: string, args: { id: string; variable: string; column: string }[] = []) {
    if (!(await this.exists(ind_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'indicatorConfigNotFound');

    const date = new Date();

    const op = oracle.op();

    op
      .write(`
          
        DELETE FROM ${TablesNames.INDICATOR_ARGUMENT}
        WHERE indicator_id = :a
      
      `, [ind_id])
      .write(`
      
        UPDATE ${TablesNames.INDICATOR_CONFIG}
        SET equation = :a, date = :b
        WHERE id = :c
      
      `, [eq, date, ind_id]);

    if (args.length > 0)
      op
        .writeMany(`
        
          INSERT INTO ${TablesNames.INDICATOR_ARGUMENT} (indicator_id, arg_id, variable, column_name)
          VALUES (:a, :b, :c, :d)
        
        `, args.map(arg => [ind_id, arg.id, arg.variable, arg.column]));

    await op.commit();

    return date;
  },




  // arguments
  // -----------------------------------------------------------------------------------
  async getArguments(indicator_id: string) {
    return (await oracle.op().read(`
    
      SELECT IA.*
      FROM
        ${TablesNames.INDICATOR_ARGUMENT} IA
      WHERE
        IA.INDICATOR_ID = :a
  
    `, [indicator_id])).rows || [];
  }
}