import { GetStatsResultReq } from "./interfaces";
import statsResultsModel from "../../../models/indicators/stats-results"

export default {

  async getByStatsId(req: GetStatsResultReq) {
    req.res.json(await statsResultsModel.getByConfigId(req.params.id));
  }
}