import { Router } from "express";
import auth from "../../../middlewares/auth";
import validate from "../../../middlewares/validate";
import controller from "./controller";
import results from "./results";
import { StatsConfigValidators } from "./validators";

export default Router()
  .get(
    '/',
    auth(['indicators.stats.get.indicator']),
    controller.get
  )
  .get(
    '/:stats_is',
    auth(['indicators.stats.get.one']),
    controller.getById
  )
  .post(
    '/',
    validate(StatsConfigValidators.CREATE),
    auth(['indicators.stats.create.one']),
    controller.create
  )
  .post(
    '/:stats_id',
    validate(StatsConfigValidators.UPDATE),
    auth(['indicators.stats.update.one']),
    controller.update
  )
  .use('/results', results);