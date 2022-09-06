import { ObjectId } from "mongodb";
import { HttpError } from "../../misc/errors";
import { HttpCode } from "../../misc/http-codes";
import { Model } from "../core";
import { Organization } from "./doc";

class OrgModel extends Model<Organization> {

  constructor() {
    super("Organziations");
  }

  get(id: ObjectId) {
    return this.col.findOne({ _id: id });
  }

  getAll() {
    return this.col.find().toArray();
  }

  getByTags(tags: string[]) {
    return this.col.find({ tags: { $in: tags } }).toArray();
  }

  async exists(id: ObjectId) {
    return (await this.col.countDocuments({ _id: id })) > 0;
  }

  async nameExists(name: string) {
    return (await this.col.countDocuments({ name })) > 0;
  }

  async create(org: Organization) {
    if (await this.nameExists(org.name))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    return (await this.col.insertOne(org)).insertedId;
  }

  async updateName(org: ObjectId, name: string) {
    if (await this.nameExists(name))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const date = Date.now();

    await this.col.updateOne({ _id: org }, { $set: { name, lastUpdatedAt: date } });

    return date;
  }

  async updateTags(org: ObjectId, tags: string[]) {
    const date = Date.now();

    await this.col.updateOne({ _id: org }, { $set: { tags, lastUpdatedAt: date } });

    return date;
  }
}

export default new OrgModel();