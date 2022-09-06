import { ObjectId } from "mongodb";
import { Doc } from "../core";

export class Auth extends Doc {
    sessions: { token: string; socket?: string, date: number }[] = [];

    constructor(public userId: ObjectId, public password: string, public salt: string) {
      super();
    }
}