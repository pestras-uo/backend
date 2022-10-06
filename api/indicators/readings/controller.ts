import readingsModel from '../../../models/indicators/readings';
import fs from 'fs';
import config from "../../../config";
import path from 'path';
import { 
  AddReadingDocumentRequest, 
  InsertReadingRequest, 
  deleteReadingDocumentRequest, 
  GetIndicatorReadingsRequest, 
  UpdateReadingRequest,
  GetReadingByIdRequest,
  ApproveReadingRequest,
  GetReadingDocumentsRequest
} from "./interfaces";

export default {

  async getByPage(req: GetIndicatorReadingsRequest) {
    req.res.json(await readingsModel.get(req.params.id, +req.query.offset, +req.query.limit));
  },

  async getById(req: GetReadingByIdRequest) {
    req.res.json(await readingsModel.getById(req.params.id, req.params.reading_id));
  },

  async getDocuments(req: GetReadingDocumentsRequest) {
    req.res.json(await readingsModel.getDocuments(req.params.id, req.params.reading_id));
  },

  async create(req: InsertReadingRequest) {
    req.res.json(await readingsModel.insert(req.params.id, req.body));
  },

  async update(req: UpdateReadingRequest) {
    req.res.json(await readingsModel.update(req.params.id, req.params.reading_id, req.body));
  },

  async approve(req: ApproveReadingRequest) {
    req.res.json(await readingsModel.approve(req.params.id, req.params.reading_id, +req.params.state));
  },

  async addDocument(req: AddReadingDocumentRequest) {
    const path = '/uploads/readings/' + req.file?.filename;

    await readingsModel.addDocument(req.params.id, req.params.reading_id, path, req.body.name_ar, req.body.name_en);

    req.res.json({ path });
  },

  async deleteDocument(req: deleteReadingDocumentRequest) {
    const filename = req.body.path.slice(req.body.path.lastIndexOf('/') + 1);
    
    await readingsModel.deleteDocument(req.body.path);
    
    fs.unlinkSync(path.join(config.uploadsDir, 'readings', req.params.id, filename));

    req.res.json(true);
  }
}