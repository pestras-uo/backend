import { TablesNames } from "..";
import oracle from "../../db/oracle";
import { IndicatorWebServiceConfig, WebServiceState } from "./interface";
import { HttpError } from "../../misc/errors";
import { HttpCode } from "../../misc/http-codes";
import { randomUUID } from 'crypto';

export default {

  // getters
  // -------------------------------------------------------------------------------
  async get(id: string) {
    return (await oracle.op().query<IndicatorWebServiceConfig>(`
    
      SELECT
        id 'id',
        resource_uri 'resource_uri',
        username 'username',
        password 'password',
        access_token 'access_token',
        query 'query',
        data_path 'data_path',
        intervals 'intervals',
        evaluation_day 'evaluation_day',
        is_cumulative 'is_cumulative',
        values_columns 'values_columns',
        additional_columns 'additional_columns',
        state 'state'
      FROM
        ${TablesNames.WEB_SERVICE_CONFIG}
      WHERE
        id = :a
    
    `, [id])).rows[0] || null;
  },




  // util
  // --------------------------------------------------------------------------------
  async exists(ind_id: string) {
    return (await oracle.op().query<{ COUNT: number }>(`
    
      SELECT COUNT(*) AS COUNT
      FROM ${TablesNames.WEB_SERVICE_CONFIG}
      WHERE id = :a

    `, [ind_id])).rows[0].COUNT! > 0;
  },




  // create
  // --------------------------------------------------------------------------------
  async create(wsConfig: Omit<IndicatorWebServiceConfig, 'ID'>) {

    await oracle.op()
      .write(`
      
        INSERT INTO ${TablesNames.WEB_SERVICE_CONFIG} (
          id,
          resource_uri,
          username,
          password,
          access_token,
          query,
          data_path,
          intervals,
          evaluation_day,
          is_cumulative,
          values_columns,
          additional_columns
        ) VALUES (:a, :b, :c, :d, :e, :f, :g, :h, :i, :j, :k, :l)
      
      `, [
        randomUUID(),
        wsConfig.resource_uri,
        wsConfig.username ? Buffer.from(wsConfig.username).toString("base64") : null,
        wsConfig.password ? Buffer.from(wsConfig.password).toString("base64") : null,
        wsConfig.access_token ? Buffer.from(wsConfig.access_token).toString("base64") : null,
        wsConfig.query,
        wsConfig.data_path,
        wsConfig.intervals,
        wsConfig.evaluation_day,
        wsConfig.is_cumulative,
        wsConfig.values_columns,
        wsConfig.additional_columns
      ])
      .commit();

    return true;
  },




  // update
  // --------------------------------------------------------------------------------
  async update(id: string, wsConfig: IndicatorWebServiceConfig) {
    if (!(await this.exists(id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'indicatorWebServiceConfigNotFound');

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.WEB_SERVICE_CONFIG}
        SET
          resource_uri = :a,
          username = :b,
          password = :c,
          access_token = :d,
          query = :e,
          data_path = :f,
          intervals = :g
          evaluation_day = :h,
          is_cumulative = :i
          values_columns = :j,
          additional_columns = :k,
          state = :l
        WHERE
          id = :m
      
      `, [
        wsConfig.resource_uri,
        wsConfig.username ? Buffer.from(wsConfig.username).toString("base64") : null,
        wsConfig.password ? Buffer.from(wsConfig.password).toString("base64") : null,
        wsConfig.access_token ? Buffer.from(wsConfig.access_token).toString("base64") : null,
        wsConfig.query,
        wsConfig.data_path,
        wsConfig.intervals,
        wsConfig.evaluation_day,
        wsConfig.is_cumulative,
        wsConfig.values_columns,
        wsConfig.additional_columns,
        WebServiceState.PENDING,
        id
      ])
      .commit();

    return true;
  },
}