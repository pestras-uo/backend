import indicatorsModel from '../../models/indicators/indicators';
import fs from 'fs';
import config from "../../config";
import path from 'path';
import {
  GetIndicatorsByTopicRequest,
  GetIndicatorsByOrgunitRequest,
  GetIndicatorsByIdRequest,
  AddIndicatorDocumentRequest,
  CreateIndicatorRequest,
  RemoveIndicatorDocuemntRequest,
  UpdateIndicatorRequest,
  UpdateIndicatorCategoriesRequest,
  UpdateIndicatorOrgunitRequest,
  UpdateIndicatorTopicRequest,
  ActivateIndicatorRequest,
  GetIndicatorsDocumentsRequest
} from "./interfaces";
import pubSub from '../../misc/pub-sub';

export default {

  // read
  // --------------------------------------------------------------------------------------
  async getByTopic(req: GetIndicatorsByTopicRequest) {
    const parents = [req.res.locals.user.orgunit_id];
    
    for (const group of req.res.locals.user.groups)
      parents.push(group.orgunit_id);

    req.res.json(await indicatorsModel.getByTopic(req.params.topic_id, parents));
  },

  async getByOrgunit(req: GetIndicatorsByOrgunitRequest) {
    req.res.json(await indicatorsModel.getByOrgunit(req.params.orgunit_id));
  },

  async get(req: GetIndicatorsByIdRequest) {
    req.res.json(await indicatorsModel.get(req.params.id));
  },




  // create
  // --------------------------------------------------------------------------------------
  async create(req: CreateIndicatorRequest) {
    const indicator = await indicatorsModel.create(req.body, req.body.parent_id, req.res.locals.user.id);

    req.res.json(indicator);

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entities_ids: [indicator.id],
      orgunit: indicator.orgunit_id
    });
  },




  // update
  // --------------------------------------------------------------------------------------
  async update(req: UpdateIndicatorRequest) {
    req.res.json(await indicatorsModel.update(req.params.id, req.body, req.res.locals.user.id));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entities_ids: [req.params.id]
    });
  },

  async updateOrgunit(req: UpdateIndicatorOrgunitRequest) {
    req.res.json(await indicatorsModel.updateOrgunit(req.params.id, req.body.orgunit_id, req.res.locals.user.id));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entities_ids: [req.params.id]
    });
  },

  async updateTopic(req: UpdateIndicatorTopicRequest) {
    req.res.json(await indicatorsModel.updateOrgunit(req.params.id, req.body.topic_id, req.res.locals.user.id));
    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entities_ids: [req.params.id]
    });
  },

  async activate(req: ActivateIndicatorRequest) {
    req.res.json(await indicatorsModel.activate(req.params.id, +req.params.state, req.res.locals.user.id));
    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entities_ids: [req.params.id]
    });
  },




  // categorries
  // --------------------------------------------------------------------------------------
  async updateCategories(req: UpdateIndicatorCategoriesRequest) {
    req.res.json(await indicatorsModel.updateCategories(req.params.id, req.body.categories, req.res.locals.user.id));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entities_ids: [req.params.id]
    });
  },




  // documents
  // --------------------------------------------------------------------------------------
  async getDocuments(req: GetIndicatorsDocumentsRequest) {
    req.res.json(await indicatorsModel.getDocuments(req.params.id));
  },

  async addDocument(req: AddIndicatorDocumentRequest) {
    const path = '/uploads/indicators/' + req.file?.filename;

    await indicatorsModel.addDocument(req.params.id, path, req.body.name_ar, req.body.name_en);

    req.res.json({ path });

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entities_ids: [req.params.id]
    });
  },

  async removeDocument(req: RemoveIndicatorDocuemntRequest) {
    const filename = req.body.path.slice(req.body.path.lastIndexOf('/') + 1);
    await indicatorsModel.deleteDocument(req.body.path);

    fs.unlinkSync(path.join(config.uploadsDir, 'indicators', req.params.id, filename));

    req.res.json(true);

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entities_ids: [req.params.id]
    });
  }
}