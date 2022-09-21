import { NextFunction, Request, Response } from 'express';
import groupsModel from '../../models/auth/groups';
import { CreateGroupBody, UpdateGroupBody } from './interfaces';

export default {

  // getters
  // ------------------------------------------------------------------------------------------
  async getAll(_: Request, res: Response, next: NextFunction) {
    try {
      res.json(await groupsModel.getAll());
    } catch (error) {
      return next(error);
    }
  },

  async get(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      res.json(await groupsModel.get(req.params.id));
    } catch (error) {
      return next(error);
    }
  },



  
  // create
  // ------------------------------------------------------------------------------------------
  async create(req: Request<any, any, CreateGroupBody>, res: Response, next: NextFunction) {
    try {
      res.json(await groupsModel.create(req.body.name_ar, req.body.name_en))
    } catch (error) {
      return next(error);
    }
  },



  
  // update
  // ------------------------------------------------------------------------------------------
  async update(req: Request<{ id: string }, any, UpdateGroupBody>, res: Response, next: NextFunction) {
    try {
      res.json(await groupsModel.update(req.params.id, req.body.name_ar, req.body.name_en))
    } catch (error) {
      return next(error);
    }
  }
}