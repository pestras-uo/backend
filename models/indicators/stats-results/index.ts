import oracle from "../../../db/oracle"
import { TablesNames } from "../../"
import { DescStatsResult } from "./interface";

export default {

  async getByConfigId(config_id: string) {
    return (await oracle.op().query<DescStatsResult>(`
    
      SELECT
        config_id "config_id",
        group_column "group_column",
        interval_date "interval_date",
        count "count",
        min "min",
        quartile_25 "quartile_25",
        quartile_50 "quartile_50",
        quartile_75 "quartile_75",
        max "max",
        range "range",
        sum "sum",
        mean "mean",
        variance "variance",
        std "std",
        mode "mode",
        skew "skew"
      FROM
        ${TablesNames.DESC_STATS_RESULT}
      WHERE
        config_id = :a
    
    `, [config_id])).rows[0] || null;
  }
}