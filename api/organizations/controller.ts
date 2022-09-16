import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { HttpError } from "../../misc/errors";
import { HttpCode } from "../../misc/http-codes";
import orgsModel from '../../models/core/organization';
import { Organization } from "../../models/core/organization/interface";
import { CreateOrganziationBody, UpdateOrganziationName, UpdateOrganziationTags } from "./interfaces";

export default {
  async getMany(req: Request, res: Response) {
    res.json(await orgsModel.getAll());
  },

  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    let id: ObjectId;

    try {
      id = new ObjectId(req.params.id);
    } catch (error) {
      return next(new HttpError(HttpCode.BAD_REQUEST, 'invalidOrgId'));
    }

    res.json(await orgsModel.get(id));
  },

  async create(req: Request<any, any, CreateOrganziationBody>, res: Response) {
    const organization = new Organization(req.body.name, req.body.tags);
    
    res.json(await orgsModel.create(organization));
  },

  async updateName(req: Request<{ id: string }, any, UpdateOrganziationName>, res: Response) {
    res.json(await orgsModel.updateName(new ObjectId(req.params.id), req.body.name));
  },

  async updateTags(req: Request<{ id: string }, any, UpdateOrganziationTags>, res: Response) {
    res.json(await orgsModel.updateTags(new ObjectId(req.params.id), req.body.tags));
  }
}