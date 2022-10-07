import { Router } from "express";
import auth from "../../../middlewares/auth";
import validate from "../../../middlewares/validate";
import controller from "./controller";
import results from "./results";
import { StatsConfigValidators } from "./validators";

export default Router()
  .get(
    '/',
    auth('indicator-stats.get.indicator'),
    controller.get
  )
  .get(
    '/:stats_id',
    auth('indicator-stats.get.one'),
    controller.getById
  )
  .post(
    '/',
    validate(StatsConfigValidators.CREATE),
    auth('indicator-stats.create.one'),
    controller.create
  )
  .put(
    '/:stats_id',
    validate(StatsConfigValidators.UPDATE),
    auth('indicator-stats.update.one'),
    controller.update
  )
  .use('/:stats_id/results', results);
