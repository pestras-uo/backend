import { TablesNames } from "../.."
import oracle from "../../../db/oracle"
import { IndicatorArgument, IndicatorEqConfig } from "./interface";
import configModel from '../config'
import { IndicatorType } from "../config/interface";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";

export default {

  // getters
  // --------------------------------------------------------------------------------------
  async get(id: string) {
    return (await oracle.op().query<IndicatorEqConfig>(`
    
      SELECT *
      FROM ${TablesNames.IND_EQ_CONFIG}
      WHERE indicator_id = :a
    
    `, [id])).rows[0] || null;
  },

  async getArguments(id: string) {
    return (await oracle.op().query<IndicatorArgument>(`
    
      SELECT *
      FROM ${TablesNames.INDICATOR_ARGUMENT}
      WHERE indicator_id = :a
    
    `, [id])).rows || [];
  },




  // util
  // --------------------------------------------------------------------------------------
  async exists(id: string) {
    return (await oracle.op().query<{ COUNT: number }>(`
    
      SELECT COUNT(*) AS COUNT
      FROM ${TablesNames.IND_EQ_CONFIG}
      WHERE indicator_id = :a

    `, [id])).rows[0].COUNT! > 0;
  },




  // create
  // --------------------------------------------------------------------------------------
  async create(id :string, eqConfig: Omit<IndicatorEqConfig, 'INDICATOR_ID'>, args: Omit<IndicatorArgument, 'INDICATOR_ID'>[]) {
    const config = await configModel.get(id);

    if (config.TYPE !== IndicatorType.EQUATION)
      throw new HttpError(HttpCode.NOT_ACCEPTABLE, 'indicatorTypeNotMatch');

    await oracle.op()
      .write(`
      
        INSERT INTO ${TablesNames.IND_EQ_CONFIG} (indicator_id, equation, clone_categories)
        VALUES (: a, :b, :c)
      
      `, [id, eqConfig.EQUATION, eqConfig.CLONE_CATEGORIES ?? 0])
      .writeMany(`
      
        INSERT INTO ${TablesNames.INDICATOR_ARGUMENT} (indicator_id, argument_id, variable, value_column)
        VALUES(:a, :b, :c, :d)
      
      `, args.map(a => [id, a.ARGUMENT_ID, a.VARIABLE, a.VALUE_COLUMN]))
      // set indicator state to 0: mark to pending
      .write(`
      
        UPDATE ${TablesNames.INDICATOR_CONFIG}
        SET state = :a
        WHERE indicator_id = :b
      
      `, [1, id])
      .commit();

    return true;
  },




  // update
  // --------------------------------------------------------------------------------------
  async update(id: string, eqConfig: IndicatorEqConfig, args: Omit<IndicatorArgument, 'INDICATOR_ID'>[]) {
    if (!(await this.exists(id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'indicatorEquationConfigNotFound');

    const op = oracle.op();

    op
      // update equation
      .write(`
    
        UPDATE ${TablesNames.IND_EQ_CONFIG}
        SET equation = :a, clone_categories = :b
        WHERE indicator_id = :c
      
      `, [eqConfig.EQUATION, eqConfig.CLONE_CATEGORIES, id])
      // clear arguments
      .write(`
    
        DELETE FROM ${TablesNames.INDICATOR_ARGUMENT}
        WHERE indicator_id = :a
      
      `, [id])
      // set indicator state to 0: mark to pending
      .write(`
      
        UPDATE ${TablesNames.INDICATOR_CONFIG}
        SET state = :a
        WHERE indicator_id = :b
      
      `, [1, id])

    if (args.length > 0) {
      op.writeMany(`
      
      INSERT INTO ${TablesNames.INDICATOR_ARGUMENT} (indicator_id, argument_id, variable, value_column)
      VALUES(:a, :b, :c, :d)
    
    `, args.map(a => [id, a.ARGUMENT_ID, a.VARIABLE, a.VALUE_COLUMN]));
    }

    await op.commit();

    return true;
  }
}