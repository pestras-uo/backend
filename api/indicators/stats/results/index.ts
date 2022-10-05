import { Router } from "express";
import auth from "../../../../middlewares/auth";
import controller from "./controller";

export default Router()
  .get(
    '/',
    auth(["indicators.stats.get.results"]),
    controller.getByStatsId
  )