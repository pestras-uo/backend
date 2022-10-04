import oracle from "db/oracle";
import { TablesNames } from "models";
import { IndicatorArgument } from "./interface";

export async function getArguments(indicator_id: string) {
  return (await oracle.op().query<IndicatorArgument>(`
  
    SELECT
      indicator_id 'indicator_id',
      argument_id 'argument_id',
      variable 'variable'
    FROM
      ${TablesNames.IND_ARG}
    WHERE
      indicator_id = :a 
  
  `, [indicator_id])).rows || [];
}

export async function getArgumentIndicators(argument_id: string) {
  return ((await oracle.op().query<IndicatorArgument>(`
  
    SELECT
      indicator_id 'indicator_id'
    FROM
      ${TablesNames.IND_ARG}
    WHERE
    argument_id = :a 
  
  `, [argument_id])).rows || []).map(r => r.indicator_id);
}