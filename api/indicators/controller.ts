import { NextFunction, Request, Response } from "express";
import indicatorsModel from '../../models/indicators/indicators';
import { AddIndicatorDocumentBody, CreateIndicatorBody, UpdateIndicatorBody, UpdateIndicatorCategoriesBody, UpdateIndicatorGroupsBody, UpdateIndicatorOrgunitBody, UpdateIndicatorTagsBody, UpdateIndicatorTopicBody } from "./interfaces";

export default {

  // read
  // --------------------------------------------------------------------------------------
  async getByTopic(req: Request<{ topic_id: string }>, res: Response, next: NextFunction) {
    try {
      res.json(await indicatorsModel.getByTopic(req.params.topic_id));
    } catch (error) {
      next(error);
    }
  },

  async getByOrgunit(req: Request<{ orgunit_id: string }>, res: Response, next: NextFunction) {
    try {
      res.json(await indicatorsModel.getByOrgunit(req.params.orgunit_id));
    } catch (error) {
      next(error);
    }
  },

  async get(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      res.json(await indicatorsModel.get(req.params.id));
    } catch (error) {
      next(error);
    }
  },



  
  // create
  // --------------------------------------------------------------------------------------
  async create(req: Request<any, any, CreateIndicatorBody>, res: Response, next: NextFunction) {
    try {
      res.json(await indicatorsModel.create({
        ORGUNIT_ID: req.body.orgunit_id,
        TOPIC_ID: req.body.topic_id,
        NAME_AR: req.body.name_ar,
        NAME_EN: req.body.name_en,
        DESC_AR: req.body.desc_ar,
        DESC_EN: req.body.desc_en,
        UNIT_AR: req.body.unit_ar,
        UNIT_EN: req.body.unit_en,
      }, req.body.parent));

    } catch (error) {
      next(error);
    }
  },




  // update
  // --------------------------------------------------------------------------------------
  async update(req: Request<{ id: string }, any, UpdateIndicatorBody>, res: Response, next: NextFunction) {
    try {
      res.json(await indicatorsModel.update(req.params.id, {
        NAME_AR: req.body.name_ar,
        NAME_EN: req.body.name_en,
        DESC_AR: req.body.desc_ar,
        DESC_EN: req.body.desc_en,
        UNIT_AR: req.body.unit_ar,
        UNIT_EN: req.body.unit_en,
      }));

    } catch (error) {
      next(error);
    }
  },

  async updateOrgunit(req: Request<{ id: string }, any, UpdateIndicatorOrgunitBody>, res: Response, next: NextFunction) {
    try {
      res.json(await indicatorsModel.updateOrgunit(req.params.id, req.body.orgunit));

    } catch (error) {
      next(error);
    }
  },

  async updateTopic(req: Request<{ id: string }, any, UpdateIndicatorTopicBody>, res: Response, next: NextFunction) {
    try {
      res.json(await indicatorsModel.updateOrgunit(req.params.id, req.body.topic));

    } catch (error) {
      next(error);
    }
  },

  async activate(req: Request<{ id: string, state: string }>, res: Response, next: NextFunction) {
    try {
      res.json(await indicatorsModel.activate(req.params.id, +req.params.state));

    } catch (error) {
      next(error);
    }
  },



  
  // groups
  // --------------------------------------------------------------------------------------
  async updateGroups(req: Request<{ id: string }, any, UpdateIndicatorGroupsBody>, res: Response, next: NextFunction) {
    try {
      res.json(await indicatorsModel.replaceGroups(req.params.id, req.body.groups));

    } catch (error) {
      next(error);
    }
  },



  
  // categorries
  // --------------------------------------------------------------------------------------
  async updateCategories(req: Request<{ id: string }, any, UpdateIndicatorCategoriesBody>, res: Response, next: NextFunction) {
    try {
      res.json(await indicatorsModel.replaceGroups(req.params.id, req.body.categories));

    } catch (error) {
      next(error);
    }
  },



  
  // tags
  // --------------------------------------------------------------------------------------
  async getTags(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      res.json(await indicatorsModel.getTags(req.params.id));

    } catch (error) {
      next(error);
    }
  },

  async updateTags(req: Request<{ id: string }, any, UpdateIndicatorTagsBody>, res: Response, next: NextFunction) {
    try {
      res.json(await indicatorsModel.replaceGroups(req.params.id, req.body.tags));

    } catch (error) {
      next(error);
    }
  },



  
  // documents
  // --------------------------------------------------------------------------------------
  async getDocuments(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      res.json(await indicatorsModel.getDocuments(req.params.id));
    } catch (error) {
      next(error);
    }
  },

  async addDocument(req: Request<{ id: string }, any, AddIndicatorDocumentBody>, res: Response, next: NextFunction) {
    try {
      const path = '/uploads/system/' + req.file?.filename;

      await indicatorsModel.addDocument(req.params.id, path, req.body.name_ar, req.body.name_en);

      res.json(path);

    } catch (error) {
      next(error);
    }
  },

  async removeDocument(req: Request<{ id: string, doc_id: string }>, res: Response, next: NextFunction) {
    try {
      res.json(await indicatorsModel.deleteDocument(req.params.id, req.params.doc_id));

    } catch (error) {
      next(error);
    }
  }
}