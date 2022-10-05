import { TablesNames } from '../..';
import oracle from '../../../db/oracle';
import { HttpError } from '../../../misc/errors';
import { HttpCode } from '../../../misc/http-codes';
import { StatsConfig } from './interface';
import { randomUUID } from 'crypto';
import { updateState } from '../indicators/update';
import { IndicatorState } from '../indicators/interface';

export default {

  // getters
  // --------------------------------------------------------------------------
  async get(indicator_id: string) {
    return (await oracle.op().query<StatsConfig>(`
    
      SELECT
        id 'id',
        indicator_id 'indicator_id',
        name_ar 'name_ar',
        name_en 'name_en',
        state 'state',
        intervals 'intervals',
        group_by_column 'group_by_column'
      FROM ${TablesNames.STATS_CONF}
      WHERE indicator_id = :a
    
    `, [indicator_id])).rows || [];
  },

  async getById(id: string) {
    return (await oracle.op().query<StatsConfig>(`
    
      SELECT
        id 'id',
        indicator_id 'indicator_id',
        name_ar 'name_ar',
        name_en 'name_en',
        state 'state',
        intervals 'intervals',
        group_by_column 'group_by_column'
      FROM ${TablesNames.STATS_CONF}
      WHERE id = :a
    
    `, [id])).rows[0] || null;
  },




  // util
  // --------------------------------------------------------------------------
  async exists(id: string) {
    return (await oracle.op().query<{ count: number }>(`
    
      SELECT COUNT(*) as 'count'
      FROM ${TablesNames.STATS_CONF}
      WHERE id = :a
    
    `, [id])).rows?.[0].count! > 0;
  },




  // create
  // --------------------------------------------------------------------------
  async create(
    indicator_id: string,
    config: Omit<StatsConfig, 'id' | 'indicator_id'>
  ) { 
    const id = randomUUID();

    await oracle.op()
      .write(`
      
        INSERT INTO ${TablesNames.STATS_CONF} (
          id, 
          indicator_id, 
          name_ar,
          name_en,
          group_by_intervals,
          group_by_column,
        )
        VALUES (:a, :b, :c, :d, :e, :f)
      
      `, [id, indicator_id, config.group_by_intervals, config.group_by_column])
      .commit();

    return this.getById(id);
  },




  // update
  // --------------------------------------------------------------------------
  async update(
    id: string, 
    indicator_id: string,
    config: Omit<StatsConfig, 'id' | 'indicator_id'>
  ) {
    if (!(await this.exists(id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'statsConfigNotFound');

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.STATS_CONF}
        SET name_ar = :a, name_en = :b, group_by_intervals = :c, group_by_column = :d
        WHERE id = :e
      
      `, [config.group_by_intervals, config.group_by_column, id])
      .commit();

    updateState(indicator_id, IndicatorState.ANALYZING);

    return true;
  }
}