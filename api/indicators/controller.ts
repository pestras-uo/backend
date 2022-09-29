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
  getIndicatorDocumentsRequest
} from "./interfaces";

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
    req.res.json(await indicatorsModel.create({
      ORGUNIT_ID: req.body.orgunit_id,
      TOPIC_ID: req.body.topic_id,
      NAME_AR: req.body.name_ar,
      NAME_EN: req.body.name_en,
      DESC_AR: req.body.desc_ar,
      DESC_EN: req.body.desc_en,
      UNIT_AR: req.body.unit_ar,
      UNIT_EN: req.body.unit_en,
    }, req.body.parent));
  },




  // update
  // --------------------------------------------------------------------------------------
  async update(req: UpdateIndicatorRequest) {
    req.res.json(await indicatorsModel.update(req.params.id, {
      NAME_AR: req.body.name_ar,
      NAME_EN: req.body.name_en,
      DESC_AR: req.body.desc_ar,
      DESC_EN: req.body.desc_en,
      UNIT_AR: req.body.unit_ar,
      UNIT_EN: req.body.unit_en,
    }));
  },

  async updateOrgunit(req: UpdateIndicatorOrgunitRequest) {
    req.res.json(await indicatorsModel.updateOrgunit(req.params.id, req.body.orgunit));
  },

  async updateTopic(req: UpdateIndicatorTopicRequest) {
    req.res.json(await indicatorsModel.updateOrgunit(req.params.id, req.body.topic));
  },

  async activate(req: ActivateIndicatorRequest) {
    req.res.json(await indicatorsModel.activate(req.params.id, +req.params.state));
  },



  
  // groups
  // --------------------------------------------------------------------------------------
  async updateGroups(req: UpdateIndicatorGroupsRequest) {
    req.res.json(await indicatorsModel.replaceGroups(req.params.id, req.body.groups));
  },



  
  // categorries
  // --------------------------------------------------------------------------------------
  async updateCategories(req: UpdateIndicatorCategoriesRequest) {
    req.res.json(await indicatorsModel.replaceGroups(req.params.id, req.body.categories));
  },



  
  // documents
  // --------------------------------------------------------------------------------------
  async getDocuments(req: getIndicatorDocumentsRequest) {
    req.res.json(await indicatorsModel.getDocuments(req.params.id));
  },

  async addDocument(req: AddIndicatorDocumentRequest) {
    const path = '/uploads/indicators/' + req.file?.filename;

    await indicatorsModel.addDocument(req.params.id, path, req.body.name_ar, req.body.name_en);

    req.res.json({ path });
  },

  async removeDocument(req: RemoveIndicatorDocuemntRequest) {
    const filename = req.body.path.slice(req.body.path.lastIndexOf('/') + 1);
    await indicatorsModel.deleteDocument(req.body.path);

    fs.unlinkSync(path.join(config.uploadsDir, 'indicators', req.params.id, filename));

    req.res.json(true);
  }
}