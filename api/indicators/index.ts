import { Router } from "express";
import auth from "../../middlewares/auth";
import exists from "../../middlewares/exists";
import validate from "../../middlewares/validate";
import { TablesNames } from "../../models";
import controller from "./controller";
import { IndicatorsValidators } from "./validators";

export default Router()
  .get(
    '/topics/:topic_id',
    auth(['indicators.get.topic']),
    controller.getByTopic
  )
  .get(
    '/orgunits/:orgunit_id',
    auth(['indicators.get.orgunit']),
    controller.getByOrgunit
  )
  .get(
    '/:id',
    auth(['indicators.get.one']),
    controller.get
  )
  .get(
    '/:id/tags',
    auth(['indicators.get.tags']),
    controller.getTags
  )
  .get(
    '/:id/documents',
    auth(['indicators.get.documents']),
    controller.getDocuments
  )

  .post(
    '/',
    validate(IndicatorsValidators.CREATE),
    auth(['indicators.create']),
    controller.create
  )

  .put(
    '/:id',
    validate(IndicatorsValidators.UPDATE),
    auth(['indicators.update']),
    controller.update
  )
  .put(
    '/:id/orgunit',
    validate(IndicatorsValidators.UPDATE_ORGUNIT),
    auth(['indicators.update.orgunit']),
    exists(TablesNames.ORGUNITS, 'body.orgunit'),
    controller.updateOrgunit
  )
  .put(
    '/:id/topic',
    validate(IndicatorsValidators.UPDATE_TOPIC),
    auth(['indicators.update.topic']),
    exists(TablesNames.TOPICS, 'body.topic'),
    controller.updateTopic
  )
  .put(
    '/:id/categories',
    validate(IndicatorsValidators.UPDATE_CATEGORIES),
    auth(['indicators.update.categories']),
    controller.updateCategories
  )
  .put(
    '/:id/groups',
    validate(IndicatorsValidators.UPDATE_GROUPS),
    auth(['indicators.update.groups']),
    controller.updateGroups
  )
  .put(
    '/:id/tags',
    validate(IndicatorsValidators.UPDATE_TAGS),
    auth(['indicators.update.tags']),
    controller.updateTags
  )
  .put(
    '/:id/documents',
    validate(IndicatorsValidators.ADD_DOCUMENT),
    auth(["indicators.update.documents"]),
    controller.addDocument
  )

  .delete(
    '/:id/documents/:doc_id',
    auth(["indicators.update.documents"]),
    controller.removeDocument
  )