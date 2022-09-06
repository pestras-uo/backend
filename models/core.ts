import { Collection, Db, ObjectId } from "mongodb";
import mongo from "../features/db";

export class Doc {
  _id?: ObjectId;
  createdAt = Date.now();
  lastUpdatedAt = this.createdAt;
  deletedAt: number | null = null;
  active = true;
}

export class Model<T extends Doc> {
  protected col!: Collection<T>;

  constructor(name: string) {
    mongo.on("connected", (db: Db) => this.col = db.collection<T>(name));
  }
}