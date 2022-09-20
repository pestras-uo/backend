import { Validall } from "@pestras/validall";
import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../misc/errors";
import { HttpCode } from "../../misc/http-codes";
import validators from "./validators";

export default {
  
  validate(schema: validators) {
    const validator = Validall.Get(schema);

    return (req: Request, res: Response, next: NextFunction) => {
      if (validator.validate(req.body))
        return next();

      next(new HttpError(HttpCode.BAD_REQUEST, validator.error.message));
    }
  }
}