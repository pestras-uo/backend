import { TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { IndicatorWebServiceConfig } from "./interface";
import configModel from '../config';
import { IndicatorType } from "../config/interface";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";

export default {

  // getters
  // -------------------------------------------------------------------------------
  async get(ind_id: string) {
    return (await oracle.op().query<IndicatorWebServiceConfig>(`
    
      SELECT *
      FROM ${TablesNames.IND_WEB_SERVICE_CONFIG}
      WHERE indicator_id = :a
    
    `, [ind_id])).rows[0] || null;
  },




  // util
  // --------------------------------------------------------------------------------
  async exists(ind_id: string) {
    return (await oracle.op().query<{ COUNT: number }>(`
    
      SELECT COUNT(*) AS COUNT
      FROM ${TablesNames.IND_WEB_SERVICE_CONFIG}
      WHERE indicator_id = :a

    `, [ind_id])).rows[0].COUNT! > 0;
  },




  // create
  // --------------------------------------------------------------------------------
  async create(wsConfig: IndicatorWebServiceConfig) {
    const config = await configModel.get(wsConfig.INDICATOR_ID);

    if (config.TYPE !== IndicatorType.WEB_SERVICE)
      throw new HttpError(HttpCode.NOT_ACCEPTABLE, 'indicatorTypeNotMatch');

    await oracle.op()
      .write(`
      
        INSERT INTO ${TablesNames.IND_WEB_SERVICE_CONFIG} (
          indicator_id,
          resource_uri,
          username,
          password,
          access_token,
          query,
          values_columns,
          reding_date_column,
          categorial_columns
        ) VALUES (:a, :b, :c, :d, :e, :f, :g, :h, :i)
      
      `, [
        wsConfig.INDICATOR_ID,
        wsConfig.RESOURCE_URI,
        wsConfig.USERNAME ? Buffer.from(wsConfig.USERNAME).toString("base64") : null,
        wsConfig.PASSWORD ? Buffer.from(wsConfig.PASSWORD).toString("base64") : null,
        wsConfig.ACCESS_TOKEN ? Buffer.from(wsConfig.ACCESS_TOKEN).toString("base64") : null,
        wsConfig.QUERY,
        wsConfig.VALUES_COLUMNS,
        wsConfig.READING_DATE_COLUMN,
        wsConfig.CATEGORIAL_COLUMNS
      ])
      // set indicator state to 0: mark to pending
      .write(`
      
        UPDATE ${TablesNames.INDICATOR_CONFIG}
        SET state = :a
        WHERE indicator_id = :b
      
      `, [1, wsConfig.INDICATOR_ID])
      .commit();

    return true;
  },




  // update
  // --------------------------------------------------------------------------------
  async update(ind_id: string, wsConfig: IndicatorWebServiceConfig) {
    if (!(await this.exists(ind_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'indicatorWebServiceConfigNotFound');

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.IND_WEB_SERVICE_CONFIG}
        SET
          resource_uri = :a,
          username = :b,
          password = :c,
          access_token = :d,
          query = :e,
          values_columns = :f,
          reding_date_column = :g,
          categorial_column = :h
        WHERE
          indicator_id = :i
      
      `, [
        wsConfig.RESOURCE_URI,
        wsConfig.USERNAME ? Buffer.from(wsConfig.USERNAME).toString("base64") : null,
        wsConfig.PASSWORD ? Buffer.from(wsConfig.PASSWORD).toString("base64") : null,
        wsConfig.ACCESS_TOKEN ? Buffer.from(wsConfig.ACCESS_TOKEN).toString("base64") : null,
        wsConfig.VALUES_COLUMNS,
        wsConfig.READING_DATE_COLUMN,
        wsConfig.CATEGORIAL_COLUMNS,
        ind_id
      ])
      // set indicator state to 0: mark to pending
      .write(`
      
        UPDATE ${TablesNames.INDICATOR_CONFIG}
        SET state = :a
        WHERE indicator_id = :b
      
      `, [1, wsConfig.INDICATOR_ID])
      .commit();

    return true;
  },
}