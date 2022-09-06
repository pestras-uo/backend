import { HttpCode } from "./http-codes";

export class HttpError extends Error {

  constructor(public readonly code: HttpCode, message: string) {
    super(message);
  }
}