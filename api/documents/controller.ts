import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { HttpError } from "../../misc/errors";
import { HttpCode } from "../../misc/http-codes";
import { CreateDocumentBody } from "./interfaces";
import documentsModel from '../../models/document';
import Document from "../../models/document/doc";
import pubSub from "../../misc/pub-sub";

export default {

  async create(req: Request<any, any, CreateDocumentBody>, res: Response, next: NextFunction) {
    const groups: ObjectId[] = [];

    try {
      if (req.body.groups)
        for (const group of req.body.groups)
          groups.push(new ObjectId(group));

    } catch (error) {
      return next(new HttpError(HttpCode.BAD_REQUEST, "invalidGroupId"));
    }

    const document = new Document(req.file?.path!, req.body.name, groups);

    document._id = await documentsModel.create(document);

    res.json(document);
  },

  async delete(req: Request<{id: string}>, res: Response, next: NextFunction) {
    let id: ObjectId; 

    try {
      id = new ObjectId(req.params.id);
    } catch (error) {
      return next(new HttpError(HttpCode.BAD_REQUEST, "invalidDocumentId"));
    }
    
    await documentsModel.delete(id);

    pubSub.emitMany(["sse.documents.delete", "documents.delete"], {data: id.toHexString() });

    res.json(true);
  }
}