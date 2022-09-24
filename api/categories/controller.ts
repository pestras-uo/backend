import { NextFunction, Request, Response } from "express";
import categoriesModel from '../../models/misc/categories';
import { CreateCategoryBody, updateCategoryBody } from "./interfaces";

export default {

  // getters
  // --------------------------------------------------------------------
  async getAll(_: Request, res: Response, next: NextFunction) {
    try {
      res.json(await categoriesModel.getAll());
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request<any, any, CreateCategoryBody>, res: Response, next: NextFunction) {
    try {
      res.json(await categoriesModel.create(req.body.name_ar, req.body.name_en, req.body.parent));
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request<{ id: string }, any, updateCategoryBody>, res: Response, next: NextFunction) {
    try {
      res.json(await categoriesModel.update(req.params.id, req.body.name_ar, req.body.name_en));
    } catch (error) {
      next(error);
    }
  }
}