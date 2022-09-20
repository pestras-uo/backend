import { NextFunction, Request, Response } from "express";
import orgsModel from '../../models/core/orgunits';
import { CreateOrganziationBody, UpdateOrganziationName } from "./interfaces";

export default {
  async getMany(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await orgsModel.getAll());
      
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      res.json(await orgsModel.get(req.params.id));
      
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request<any, any, CreateOrganziationBody>, res: Response, next: NextFunction) {
    try {
      res.json(await orgsModel.create(req.body.name_ar, req.body.name_en, req.body.parent_id));
      
    } catch (error) {
      next(error);
    }
  },

  async updateName(req: Request<{ id: string }, any, UpdateOrganziationName>, res: Response, next: NextFunction) {
    try {
      res.json(await orgsModel.update(req.params.id, req.body.name_ar, req.body.name_en));
      
    } catch (error) {
      next(error);
    }
  }
}