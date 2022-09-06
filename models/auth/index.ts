import { ObjectId } from "mongodb";
import { Model } from "../core";
import { Auth } from "./doc";

class AuthModel extends Model<Auth> {

  constructor() {
    super("Auth");
  }

  getPassword(userId: ObjectId) {
    return this.col.findOne({ userId }, { projection: { password: 1, salt: 1, lastUpdateDate: 1 } });
  }

  async create(userId: ObjectId, password: string, salt: string) {
    await this.col.insertOne(new Auth(userId, password, salt));
  }

  async updatePassword(userId: ObjectId, password: string, salt: string) {
    const lastUpdatedAt = Date.now();

    await this.col.updateOne({ userId }, { $set: { password, salt, lastUpdatedAt } });

    return lastUpdatedAt;
  }

  async addSession(userId: ObjectId, token: string) {
    const date = Date.now();

    await this.col.updateOne({ userId }, { $push: { sessions: { date, token } } });

    return date;
  }

  async updateSession(userId: ObjectId, oldToken: string, newtoken: string) {
    const date = Date.now();

    await this.col.updateOne({ userId, 'sessions.$.token': oldToken }, { $set: { 'sessions.$.token': newtoken } });

    return date;
  }

  async addSocket(userId: ObjectId, token: string, socket: string) {
    const date = Date.now();

    await this.col.updateOne(
      { userId, 'sessions$.token': token },
      {
        $set: { 'sessions.$.socket': socket }
      });

    return date;
  }

  async removeSocket(userId: ObjectId, token: string) {
    const date = Date.now();

    await this.col.updateOne(
      { userId, 'sessions$.token': token },
      {
        $unset: { 'sessions.$.socket': 1 }
      });

    return date;
  }

  async hasSession(userId: ObjectId, token: string) {
    return (await this.col.countDocuments({ userId, 'sessions.$.token': token })) > 0;
  }

  async removeSession(userId: ObjectId, token: string) {
    await this.col.updateOne({ userId }, { $pull: { sessions: { token } } });
  }
}

export default new AuthModel();