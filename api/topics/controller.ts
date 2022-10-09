import topicsModel from '../../models/core/topics';
import fs from 'fs';
import config from "../../config";
import path from 'path';
import { 
  AddTopicDocumentRequest, 
  CreateTopicRequest, 
  deleteTopicDocumentRequest, 
  GetAllTopicsRequest, 
  GetTopicByIdRequest, 
  UpdateTopicRequest, 
  UpdateTopicCategoriesRequest,
  GetTopicDocumentsRequest 
} from "./interfaces";
import pubSub from '../../misc/pub-sub';

export default {

  // getters
  // ------------------------------------------------------------------------------
  async getAll(req: GetAllTopicsRequest) {
    req.res.json(await topicsModel.getAll());
  },

  async get(req: GetTopicByIdRequest) {
    req.res.json(await topicsModel.get(req.params.id));
  },




  // create
  // ------------------------------------------------------------------------------
  async create(req: CreateTopicRequest) {
    const topic = await topicsModel.create(
      req.body,
      req.body.parent_id,
      req.res.locals.user.id
    )
    req.res.json(topic);

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entity_id: topic.id,
      issuer: req.res.locals.user.id
    });
  },




  // update
  // ------------------------------------------------------------------------------
  async update(req: UpdateTopicRequest) {
    req.res.json(await topicsModel.update(
      req.params.id,
      req.body.name_ar,
      req.body.name_en,
      req.body.desc_ar,
      req.body.desc_en,
      req.res.locals.user.id
    ));
    pubSub.emit("publish", {
      action: req.res.locals.action,
      entity_id: req.params.id,
      issuer: req.res.locals.user.id
    });
  },




  // categories
  // ------------------------------------------------------------------------------
  async updateCategories(req: UpdateTopicCategoriesRequest) {
    req.res.json(await topicsModel.updateCategories(
      req.params.id,
      req.body.categories,
      req.res.locals.user.id
    ));

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entity_id: req.params.id,
      issuer: req.res.locals.user.id
    });
  },




  // documents
  // ------------------------------------------------------------------------------
  async getDocuments(req: GetTopicDocumentsRequest) {
    req.res.json(await topicsModel.getDocuments(req.params.id));
  },

  async addDocument(req: AddTopicDocumentRequest) {
    const path = '/uploads/topics/' + req.file?.filename;

    await topicsModel.addDocument(req.params.id, path, req.body.name_ar, req.body.name_en);

    req.res.json({ path });

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entity_id: req.params.id,
      issuer: req.res.locals.user.id
    });
  },

  async removeDocument(req: deleteTopicDocumentRequest) {
    const filename = req.body.path.slice(req.body.path.lastIndexOf('/') + 1);

    await topicsModel.deleteDocument(req.body.path);

    fs.unlinkSync(path.join(config.uploadsDir, 'topics', req.params.id, filename));

    req.res.json(true);

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entity_id: req.params.id,
      issuer: req.res.locals.user.id
    });
  }
}