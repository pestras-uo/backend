import { Router } from "express";
import auth from "../../../../middlewares/auth";
import controller from "./controller";

export default Router()
  .get(
    '/',
    auth("indicator-stats.get.results"),
    controller.getByStatsId
  )