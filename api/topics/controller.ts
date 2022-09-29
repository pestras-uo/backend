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
  UpdateTopicGroupsRequest, 
  GetTopicDocumentsRequest 
} from "./interfaces";

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
    req.res.json(await topicsModel.create(
      req.body.name_ar,
      req.body.name_en,
      req.body.parent,
      req.body.desc_ar,
      req.body.desc_en,
    ));
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
    ));
  },




  // groups
  // ------------------------------------------------------------------------------
  async updateGroups(req: UpdateTopicGroupsRequest) {
    req.res.json(await topicsModel.replaceGroups(req.params.id, req.body.groups));
  },




  // categories
  // ------------------------------------------------------------------------------
  async updateCategories(req: UpdateTopicCategoriesRequest) {
    req.res.json(await topicsModel.replaceCategories(req.params.id, req.body.categories));
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
  },

  async removeDocument(req: deleteTopicDocumentRequest) {
    const filename = req.body.path.slice(req.body.path.lastIndexOf('/') + 1);

    await topicsModel.deleteDocument(req.body.path);

    fs.unlinkSync(path.join(config.uploadsDir, 'topics', req.params.id, filename));

    req.res.json(true);
  }
}