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
  UpdateIndicatorGroupsRequest,
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
    req.res.json(await indicatorsModel.getByTopic(req.params.topic_id));
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
    const indicator = await indicatorsModel.create({
      orgunit_id: req.body.orgunit_id,
      topic_id: req.body.topic_id,
      name_ar: req.body.name_ar,
      name_en: req.body.name_en,
      desc_ar: req.body.desc_ar,
      desc_en: req.body.desc_en,
      unit_ar: req.body.unit_ar,
      unit_en: req.body.unit_en,
    }, req.body.parent);

    req.res.json(indicator);

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entity_id: indicator.id,
      orgunit: indicator.orgunit_id
    });
  },




  // update
  // --------------------------------------------------------------------------------------
  async update(req: UpdateIndicatorRequest) {
    req.res.json(await indicatorsModel.update(req.params.id, {
      name_ar: req.body.name_ar,
      name_en: req.body.name_en,
      desc_ar: req.body.desc_ar,
      desc_en: req.body.desc_en,
      unit_ar: req.body.unit_ar,
      unit_en: req.body.unit_en,
    }));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entity_id: req.params.id
    });
  },

  async updateOrgunit(req: UpdateIndicatorOrgunitRequest) {
    req.res.json(await indicatorsModel.updateOrgunit(req.params.id, req.body.orgunit_id));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entity_id: req.params.id
    });
  },

  async updateTopic(req: UpdateIndicatorTopicRequest) {
    req.res.json(await indicatorsModel.updateOrgunit(req.params.id, req.body.topic_id));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entity_id: req.params.id
    });
  },

  async activate(req: ActivateIndicatorRequest) {
    req.res.json(await indicatorsModel.activate(req.params.id, +req.params.state));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entity_id: req.params.id
    });
  },




  // groups
  // --------------------------------------------------------------------------------------
  async updateGroups(req: UpdateIndicatorGroupsRequest) {
    req.res.json(await indicatorsModel.replaceGroups(req.params.id, req.body.groups));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entity_id: req.params.id
    });
  },




  // categorries
  // --------------------------------------------------------------------------------------
  async updateCategories(req: UpdateIndicatorCategoriesRequest) {
    req.res.json(await indicatorsModel.replaceGroups(req.params.id, req.body.categories));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.issuer,
      entity_id: req.params.id
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
      entity_id: req.params.id
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
      entity_id: req.params.id
    });
  }
}