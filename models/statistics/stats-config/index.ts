import { TablesNames } from '../..';
import oracle from '../../../db/oracle';
import { HttpError } from '../../../misc/errors';
import { HttpCode } from '../../../misc/http-codes';
import { StatsConfig } from './interface';

export default {

  // getters
  // --------------------------------------------------------------------------
  async get(indicator_id: string) {
    return (await oracle.op().query<StatsConfig>(`
    
      SELECT *
      FROM ${TablesNames.STATS_CONFIG}
      WHERE indicator_id = :a
    
    `, [indicator_id])).rows?.[0] || null;
  },




  // util
  // --------------------------------------------------------------------------
  async exists(indicator_id: string, col_name: string) {
    return (await oracle.op().query<{ COUNT: number }>(`
    
      SELECT COUNT(*) as COUNT
      FROM ${TablesNames.STATS_CONFIG}
      WHERE indicator_id = :a AND column_name = :b
    
    `, [indicator_id, col_name])).rows?.[0].COUNT! > 0;
  },




  // create
  // --------------------------------------------------------------------------
  async create(ind_id: string, col_name: string, schedual: number, is_sample: number, interval: number, groupBy: string[]) {
    if (await this.exists(ind_id, col_name))
      throw new HttpError(HttpCode.CONFLICT, 'statsConfigAlreadyExists');

    await oracle.op()
      .write(`
      
        INSERT INTO ${TablesNames.STATS_CONFIG} (indicator_id, column_name, schedual, is_sample, interval, group_by)
        VALUES (:a, :b, :c, :d, :e, :f)
      
      `, [ind_id, col_name, schedual, is_sample, interval, groupBy.join(",")])
      .commit();

    return true;
  },




  // update
  // --------------------------------------------------------------------------
  async update(ind_id: string, col_name: string, schedual: number, is_sample: number, interval: number, groupBy: string[]) {
    if (!(await this.exists(ind_id, col_name)))
      throw new HttpError(HttpCode.NOT_FOUND, 'statsConfigNotFound');

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.STATS_CONFIG}
        SET schedual = :a, is_sample = :b, interval = :c, group_by = :d
        WHERE indicator_id = :e AND column_name = :f
      
      `, [schedual, is_sample, interval, groupBy.join(','), ind_id, col_name])
      .commit();

    return true;
  },




  // recalculate
  // --------------------------------------------------------------------------
  async recalculate(ind_id: string, col_name: string, recalc: number) {
    if (!(await this.exists(ind_id, col_name)))
      throw new HttpError(HttpCode.NOT_FOUND, 'statsConfigNotFound');

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.STATS_CONFIG}
        SET recalculate = :a
        WHERE indicator_id = :e AND column_name = :f
      
      `, [recalc, ind_id, col_name])
      .commit();

    return true;
  }
}