import { TablesNames } from "../.."
import oracle from "../../../db/oracle"
import { IndicatorViewConfig } from "./interface";
import configModel from '../config'
import { IndicatorType } from "../config/interface";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";

export default {

  // getters
  // -----------------------------------------------------------------------------
  async get(ind_id: string) {
    return (await oracle.op().query<IndicatorViewConfig>(`
    
      SELECT *
      FROM ${TablesNames.IND_VIEW_CONFIG}
      WHERE indicator_id = :a
    
    `, [ind_id])).rows[0] || null;
  },




  // util
  // --------------------------------------------------------------------------------------
  async exists(ind_id: string) {
    return (await oracle.op().query<{ COUNT: number }>(`
    
      SELECT COUNT(*) AS COUNT
      FROM ${TablesNames.IND_VIEW_CONFIG}
      WHERE indicator_id = :a

    `, [ind_id])).rows[0].COUNT! > 0;
  },




  // create
  // -----------------------------------------------------------------------------
  async create(vConfig: IndicatorViewConfig) {
    const config = await configModel.get(vConfig.INDICATOR_ID);

    if (config.TYPE !== IndicatorType.VIEW)
      throw new HttpError(HttpCode.NOT_ACCEPTABLE, 'indicatorTypeNotMatch');

    await oracle.op()
      .write(`
      
        INSERT INTO ${TablesNames.IND_VIEW_CONFIG} (
          indicator_id,
          readings_view,
          values_columns,
          reding_date_column,
          categorial_columns
        ) VALUES (:a, :b, :c, :d, :e)
      
      `, [
        vConfig.INDICATOR_ID,
        vConfig.READINGS_VIEW,
        vConfig.VALUES_COLUMNS,
        vConfig.READING_DATE_COLUMN,
        vConfig.CATEGORIAL_COLUMNS
      ])
      // set indicator state to 0: mark to pending
      .write(`
      
        UPDATE ${TablesNames.INDICATOR_CONFIG}
        SET state = :a
        WHERE indicator_id = :b
      
      `, [1, vConfig.INDICATOR_ID])
      .commit();

    return true;
  },




  // update
  // -----------------------------------------------------------------------------
  async update(ind_id: string, vConfig: Partial<IndicatorViewConfig>) {
    if (!(await this.exists(ind_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'indicatorViewConfigNotFound');

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.IND_VIEW_CONFIG}
        SET 
          readings_view = :a, 
          values_columns = :b,
          reding_date_column = :c,
          categorial_columns = :d
        WHERE
          indicator_id = :e
      
      `, [
        vConfig.READINGS_VIEW,
        vConfig.VALUES_COLUMNS,
        vConfig.READING_DATE_COLUMN,
        vConfig.CATEGORIAL_COLUMNS,
        ind_id
      ])
      // set indicator state to 0: mark to pending
      .write(`
      
        UPDATE ${TablesNames.INDICATOR_CONFIG}
        SET state = :a
        WHERE indicator_id = :b
      
      `, [1, ind_id])
      .commit();

      return true;
  }
}