import { NextFunction, Request, Response } from "express";
import topicsModel from '../../models/core/topics';
import { AddTopicDocument, CreateTopicBody, UpdateTopicBody, UpdateTopicCategories, UpdateTopicGroups } from "./interfaces";
import docsModel from '../../models/misc/document';

export default {

  // getters
  // ------------------------------------------------------------------------------
  async getAll(_: Request, res: Response, next: NextFunction) {
    try {
      res.json(await topicsModel.getAll());
    } catch (error) {
      next(error);
    }
  },

  async get(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      res.json(await topicsModel.get(req.params.id));
    } catch (error) {
      next(error);
    }
  },

  async getTags(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      res.json(await topicsModel.getTags(req.params.id));
    } catch (error) {
      next(error);
    }
  },



  
  // create
  // ------------------------------------------------------------------------------
  async create(req: Request<any, any, CreateTopicBody>, res: Response, next: NextFunction) {
    try {
      res.json(await topicsModel.create(
        req.body.name_ar,
        req.body.name_en,
        req.body.parent,
        req.body.desc_ar,
        req.body.desc_en,
      ));
    } catch (error) {
      next(error);
    }
  },



  
  // update
  // ------------------------------------------------------------------------------
  async update(req: Request<{ id: string }, any, UpdateTopicBody>, res: Response, next: NextFunction) {
    try {
      res.json(await topicsModel.update(
        req.params.id,
        req.body.name_ar,
        req.body.name_en,
        req.body.desc_ar,
        req.body.desc_en,
      ));
    } catch (error) {
      next(error);
    }
  },



  
  // groups
  // ------------------------------------------------------------------------------
  async updateGroups(req: Request<{ id: string }, any, UpdateTopicGroups>, res: Response, next: NextFunction) {
    try {
      res.json(await topicsModel.replaceGroups(req.params.id, req.body.groups));

    } catch (error) {
      next(error);
    }
  },



  
  // categories
  // ------------------------------------------------------------------------------
  async updateCategories(req: Request<{ id: string }, any, UpdateTopicCategories>, res: Response, next: NextFunction) {
    try {
      res.json(await topicsModel.replaceCategories(req.params.id, req.body.categories));

    } catch (error) {
      next(error);
    }
  },



  
  // documents
  // ------------------------------------------------------------------------------
  async getDocuments(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      res.json(await topicsModel.getDocuments(req.params.id));
    } catch (error) {
      next(error);
    }
  },

  async addDocument(req: Request<{ id: string }, any, AddTopicDocument>, res: Response, next: NextFunction) {
    try {
      const path = '/uploads/system/' + req.file?.filename;

      await topicsModel.addDocument(req.params.id, path, req.body.name_ar, req.body.name_en);

      res.json(path);

    } catch (error) {
      next(error);
    }
  },

  async removeDocument(req: Request<{ id: string, doc_id: string }>, res: Response, next: NextFunction) {
    try {
      res.json(await topicsModel.deleteDocument(req.params.id, req.params.doc_id));

    } catch (error) {
      next(error);
    }
  }
}