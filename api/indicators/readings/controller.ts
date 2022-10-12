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
import pubSub from '../../../misc/pub-sub';

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
    const reading = await readingsModel.insert(req.params.id, req.body, req.res.locals.user.id);
    req.res.json(reading);

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.user.id,
      entities_ids: [`${req.params.id}/${reading.id}`]
    });
  },

  async update(req: UpdateReadingRequest) {
    req.res.json(await readingsModel.update(req.params.id, req.params.reading_id, req.body, req. res.locals.user.id));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.user.id,
      entities_ids: [`${req.params.id}/${req.params.reading_id}`]
    });
  },

  async approve(req: ApproveReadingRequest) {
    req.res.json(await readingsModel.approve(req.params.id, req.params.reading_id, +req.params.state));

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.user.id,
      entities_ids: [`${req.params.id}/${req.params.reading_id}`]
    });
  },

  async addDocument(req: AddReadingDocumentRequest) {
    const path = '/uploads/readings/' + req.file?.filename;

    await readingsModel.addDocument(req.params.id, req.params.reading_id, path, req.body.name_ar, req.body.name_en);

    req.res.json({ path });
    
    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.user.id,
      entities_ids: [`${req.params.id}/${req.params.reading_id}`]
    });
  },

  async deleteDocument(req: deleteReadingDocumentRequest) {
    const filename = req.body.path.slice(req.body.path.lastIndexOf('/') + 1);
    
    await readingsModel.deleteDocument(req.body.path);
    
    fs.unlinkSync(path.join(config.uploadsDir, 'readings', req.params.id, filename));

    req.res.json(true);

    pubSub.emit('publish', {
      action: req.res.locals.action,
      issuer: req.res.locals.user.id,
      entities_ids: [`${req.params.id}/${req.params.reading_id}`]
    });
  }
}