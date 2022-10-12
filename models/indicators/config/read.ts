import oracle from "../../../db/oracle";
import { TablesNames } from "../../";
import { DBIndConf, IndConf } from "./interface";
import { omit } from "../../../util/pick-omit";

export async function get(indicator_id: string) {
  const result = (await oracle.op().query<DBIndConf>(`
  
    SELECT
      indicator_id "indicator_id",
      source_name "source_name",
      type "type",
      intervals "intervals",
      evaluation_day "evaluation_day",
      require_approval "require_approval",
      kpi_min "kpi_min",
      kpi_max "kpi_max",
      state "state",
      compute_options "compute_options",
      filter_options "filter_options",
      columns "columns"
    FROM
      ${TablesNames.IND_CONF}
    WHERE
      indicator_id = :a
  
  `, [indicator_id])).rows?.[0] || null;

  return result
    ? {
      ...omit(result, ['compute_options', 'filter_options', 'columns']), 
      compute_options: result.compute_options ? JSON.parse(result.compute_options) : null,
      filter_options: result.filter_options ? JSON.parse(result.filter_options) : null,
      columns: JSON.parse(result.columns)
    } as IndConf
    : null
}