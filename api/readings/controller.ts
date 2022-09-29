import readingsModel from '../../models/readings';
import fs from 'fs';
import config from "../../config";
import path from 'path';
import { 
  AddReadingDocumentRequest, 
  CreateReadingRequest, 
  deleteReadingDocumentRequest, 
  GetReadingsRequest, 
  UpdateReadingRequest, 
  updateReadingCategoriesRequest,
  GetReadingByIdRequest,
  ApproveReadingRequest,
  DeleteReadingRequest,
  GetReadingCategoriesRequest,
  GetReadingDocumentsRequest
} from "./interfaces";

export default {

  async getByPage(req: GetReadingsRequest) {
    req.res.json(await readingsModel.get(req.params.ind_id, +req.query.offset, +req.query.limit));
  },

  async getById(req: GetReadingByIdRequest) {
    req.res.json(await readingsModel.getById(req.params.ind_id, req.params.id));
  },

  async create(req: CreateReadingRequest) {
    req.res.json(await readingsModel.create(req.params.ind_id, {
      READING_VALUE: req.body.reading_value,
      READING_DATE: req.body.reading_date,
      NOTE_AR: req.body.note_ar,
      NOTE_EN: req.body.note_en
    }));
  },

  async update(req: UpdateReadingRequest) {
    req.res.json(await readingsModel.update(req.params.ind_id, req.params.id, {
      READING_VALUE: req.body.reading_value,
      READING_DATE: req.body.reading_date,
      NOTE_AR: req.body.note_ar,
      NOTE_EN: req.body.note_en
    }));
  },

  async approve(req: ApproveReadingRequest) {
    req.res.json(await readingsModel.approve(req.params.ind_id, req.params.id, +req.params.state));
  },

  async delete(req: DeleteReadingRequest) {
    req.res.json(await readingsModel.delete(req.params.ind_id, req.params.id));
  },

  async getCategories(req: GetReadingCategoriesRequest) {
    req.res.json(await readingsModel.getCategories(req.params.id));
  },

  async updateCategories(req: updateReadingCategoriesRequest) {
    req.res.json(await readingsModel.replaceCategories(req.params.ind_id, req.params.id, req.body.categories));
  },

  async getDocuments(req: GetReadingDocumentsRequest) {
    req.res.json(await readingsModel.getDocuments(req.params.ind_id, req.params.id));
  },

  async addDocument(req: AddReadingDocumentRequest) {
    const path = '/uploads/readings/' + req.file?.filename;

    await readingsModel.addDocument(req.params.ind_id, req.params.id, path, req.body.name_ar, req.body.name_en);

    req.res.json({ path });
  },

  async deleteDocument(req: deleteReadingDocumentRequest) {
    const filename = req.body.path.slice(req.body.path.lastIndexOf('/') + 1);
    
    await readingsModel.deleteDocument(req.body.path);
    
    fs.unlinkSync(path.join(config.uploadsDir, 'readings', req.params.id, filename));

    req.res.json(true);
  }
}