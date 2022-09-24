import { NextFunction, Request, Response } from "express";
import tagsModel from '../../models/misc/tags';
import { CreateTagKeyBody, CreateTagValueBody, UpdateTagKeyBody } from "./interfaces";

export default {

  // getters
  // ----------------------------------------------------------------------
  async getKeys(_: Request, res: Response, next: NextFunction) {
    try {
      res.json(await tagsModel.getKeys());
    } catch (error) {
      next(error);
    }
  },

  async getValues(_: Request, res: Response, next: NextFunction) {
    try {
      res.json(await tagsModel.getValues());
    } catch (error) {
      next(error);
    }
  },



  
  // create
  // ----------------------------------------------------------------------
  async createKey(req: Request<any, any, CreateTagKeyBody>, res: Response, next: NextFunction) {
    try {
      res.json(await tagsModel.createKey(req.body.name_ar, req.body.name_en))
    } catch (error) {
      next(error);
    }
  },

  async createValue(req: Request<{ key_id: string }, any, CreateTagValueBody>, res: Response, next: NextFunction) {
    try {
      res.json(await tagsModel.createValue(req.params.key_id, req.body.name_ar, req.body.name_en))
    } catch (error) {
      next(error);
    }
  },



  
  // update
  // ----------------------------------------------------------------------
  async updateKey(req: Request<{ id: string }, any, UpdateTagKeyBody>, res: Response, next: NextFunction) {
    try {
      res.json(await tagsModel.updateKey(req.params.id, req.body.name_ar, req.body.name_en))
    } catch (error) {
      next(error);
    }
  },

  async updateValue(req: Request<{ key_id: string, id: string }, any, CreateTagKeyBody>, res: Response, next: NextFunction) {
    try {
      res.json(await tagsModel.updateValue(req.params.key_id, req.params.id, req.body.name_ar, req.body.name_en))
    } catch (error) {
      next(error);
    }
  },
}