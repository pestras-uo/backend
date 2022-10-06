import oracle from "../../../db/oracle";
import { TablesNames } from "../../";
import { IndicatorConfig } from "./interface";

export async function get(indicator_id: string) {
  return (await oracle.op().query<IndicatorConfig>(`
  
    SELECT
      indicator_id "indicator_id",
      reading_value_name_ar "reading_value_name_ar",
      reading_value_name_en "reading_value_name_en",
      intervals "intervals",
      evaluation_day "evaluation_day",
      require_approval "require_approval",
      kpi_min "kpi_min",
      kpi_max "kpi_max",
      view_name "view_name",
      equation "equation",
      match_by_columns "match_by_columns",
      state "state"
    FROM ${TablesNames.IND_CONF}
    WHERE indicator_id = :a
  
  `, [indicator_id])).rows?.[0] || null;
}