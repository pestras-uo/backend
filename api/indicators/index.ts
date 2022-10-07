import { Router } from "express";
import auth from "../../middlewares/auth";
import exists from "../../middlewares/exists";
import validate from "../../middlewares/validate";
import { TablesNames } from "../../models";
import controller from "./controller";
import { IndicatorsValidators } from "./validators";
import { docUpload } from '../../middlewares/upload';
import config from "./config";
import readings from "./readings";
import stats from "./stats";

export default Router()
  .get(
    '/topics/:topic_id',
    auth('indicators.get.topic'),
    controller.getByTopic
  )
  .get(
    '/orgunits/:orgunit_id',
    auth('indicators.get.orgunit'),
    controller.getByOrgunit
  )
  .get(
    '/:id',
    auth('indicators.get.one'),
    controller.get
  )
  .get(
    '/:id/documents',
    auth('indicators.get.documents'),
    controller.getDocuments
  )

  .post(
    '/',
    validate(IndicatorsValidators.CREATE),
    auth('indicators.create.one'),
    controller.create
  )
  .post(
    '/:id/documents',
    validate(IndicatorsValidators.ADD_DOCUMENT),
    auth("indicators.create.documents"),
    docUpload.single('document'),
    controller.addDocument
  )

  .put(
    '/:id',
    validate(IndicatorsValidators.UPDATE),
    auth('indicators.update.one'),
    controller.update
  )
  .put(
    '/:id/orgunit',
    validate(IndicatorsValidators.UPDATE_ORGUNIT),
    auth('indicators.update.orgunit'),
    exists(TablesNames.ORGUNITS, 'body.orgunit'),
    controller.updateOrgunit
  )
  .put(
    '/:id/topic',
    validate(IndicatorsValidators.UPDATE_TOPIC),
    auth('indicators.update.topic'),
    exists(TablesNames.TOPICS, 'body.topic'),
    controller.updateTopic
  )
  .put(
    '/:id/categories',
    validate(IndicatorsValidators.UPDATE_CATEGORIES),
    auth('indicators.update.categories'),
    controller.updateCategories
  )
  .put(
    '/:id/groups',
    validate(IndicatorsValidators.UPDATE_GROUPS),
    auth('indicators.update.groups'),
    controller.updateGroups
  )

  .delete(
    '/:id/document',
    validate(IndicatorsValidators.DELETE_DOCUMENT),
    auth("indicators.delete.documents"),
    controller.removeDocument
  )
  .use('/:id/config', exists(TablesNames.INDICATORS, 'params.id'), config)
  .use('/:id/readings', exists(TablesNames.INDICATORS, 'params.id'), readings)
  .use('/:id/stats', exists(TablesNames.INDICATORS, 'params.id'), stats)