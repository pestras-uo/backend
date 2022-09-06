import { Db, MongoClient } from "mongodb";
import config from "../config";
import eventEmiiter from 'events';

class Mongo extends eventEmiiter {
  db!: Db;
  async connect() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    if (!config.dbUrl)
      throw new Error("db url was not provided!");

    try {
      const client = await MongoClient.connect(config.dbUrl, { loggerLevel: config.mode === "development" ? "info" : "warn" });
      this.db = client.db();
      
      this.emit('connected', this.db);

      listenForProcessEnd(client);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
}

function listenForProcessEnd(conn: MongoClient) {
  process.on('SIGTERM', () => conn.close());
  process.on('SIGINT', () => conn.close());
  process.on('SIGHUP', () => conn.close());
}

export default new Mongo();