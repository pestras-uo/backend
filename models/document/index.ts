import { ObjectId } from "mongodb";
import { Model } from "../core";
import Document from "./doc";

class DocumentsModel extends Model<Document> {
  
  constructor() {
    super('Documents');
  }




  // get methods
  // ----------------------------------------------------------------------------------------------------------------
  get(id: ObjectId) {
    return this.col.findOne({ _id: id });
  }

  getByPath(path: string) {
    return this.col.findOne({ path });
  }

  getByGroup(group: ObjectId) {
    return this.col.find({ groups: group }).toArray();
  }




  // create methods
  // ----------------------------------------------------------------------------------------------------------------
  async create(doc: Document) {
    return (await this.col.insertOne(doc)).insertedId;
  }




  // delete methods
  // ----------------------------------------------------------------------------------------------------------------
  delete(id: ObjectId) {
    return this.col.deleteOne({ _id: id });
  }
}

export default new DocumentsModel();