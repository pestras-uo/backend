import { NextFunction, Request, Response } from "express";
import orgsModel from '../../models/core/orgunits';
import { CreateOrganziationBody, UpdateOrganziationName } from "./interfaces";

export default {
  async getMany(req: Request, res: Response) {
    res.json(await orgsModel.getAll());
  },

  async getById(req: Request<{ id: string }>, res: Response) {
    res.json(await orgsModel.get(req.params.id));
  },

  async create(req: Request<any, any, CreateOrganziationBody>, res: Response) {
    res.json(await orgsModel.create(req.body.name_ar, req.body.name_en, req.body.parent_id));
  },

  async updateName(req: Request<{ id: string }, any, UpdateOrganziationName>, res: Response) {
    res.json(await orgsModel.update(req.params.id, req.body.name_ar, req.body.name_en));
  }
}