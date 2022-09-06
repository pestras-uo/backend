import { User, UserProfile } from './doc';
import { Model } from "../core";
import { Filter, ObjectId } from 'mongodb';
import { Role } from '../../auth/roles';
import { HttpError } from '../../misc/errors';
import { HttpCode } from '../../misc/http-codes';

class UsersModel extends Model<User>{

  constructor() {
    super("Users");
  }




  // util methods
  // ----------------------------------------------------------------------------------------------------------------
  async exists(id: ObjectId) {
    return (await this.col.countDocuments({ _id: id })) > 0;
  }
  
  async usernameExists(username: string) {
    return (await this.col.countDocuments({ username })) > 0;
  }

  async emailExists(email: string) {
    return (await this.col.countDocuments({ $or: [{ 'email.0': email }, { 'backupEmail.0': email }] })) > 0;
  }

  async usernameOremailExists(username: string, email: string) {
    const user = await this.col.findOne(
      { $or: [{ 'email.0': email }, { 'backupEmail.0': email }, { username }] },
      { projection: { email: 1, backupEmail: 1, username: 1 } }
    );

    return !user ? 0 : user.username === username ? 1 : 2;
  }




  // getters
  // ----------------------------------------------------------------------------------------------------------------
  get(userId: ObjectId, projection?: Partial<Record<keyof User, number>>) {
    return this.col.findOne({ _id: userId }, { projection });
  }

  getByUsername(username: string, projection?: Partial<Record<keyof User, number>>) {
    return this.col.findOne({ username }, { projection });
  }

  getByEmail(email: string, projection?: Partial<Record<keyof User, number>>) {
    return this.col.findOne({ email }, { projection });
  }

  getByBackupEmail(backupEmail: string, projection?: Partial<Record<keyof User, number>>) {
    return this.col.findOne({ backupEmail }, { projection });
  }

  getMany(query: Filter<User>, projection?: Partial<Record<keyof User, any>>) {
    return this.col.find(query, { projection }).toArray();
  }




  // create
  // ----------------------------------------------------------------------------------------------------------------
  async create(user: User) {
    const exists = await this.usernameOremailExists(user.username, user.email[0]);
    
    if (exists)
      throw new HttpError(HttpCode.CONFLICT, exists === 1 ? "usernameAlreadyExists" : "emailAlreadyExists");

    user._id = (await this.col.insertOne(user)).insertedId;
    
    return user;
  }




  // username
  // ----------------------------------------------------------------------------------------------------------------
  async updateUsername(userId: ObjectId, username: string) {
    const date = Date.now();

    if (await this.usernameExists(username))
      throw new HttpError(HttpCode.CONFLICT, "usernameAlreadyExists");

    await this.col.updateOne({ _id: userId }, { $set: { username, lastUpdatedAt: date } });

    return date;
  }




  // email
  // ----------------------------------------------------------------------------------------------------------------
  async updateEmail(userId: ObjectId, email: string, backup = false) {
    const date = Date.now();

    if (await this.emailExists(email))
      throw new HttpError(HttpCode.CONFLICT, "emailAlreadyExists");

    if (backup) {
      await this.col.updateOne({ _id: userId }, {
        $set: {
          backupEmail: [email, false],
          lastUpdatedAt: date
        }
      });

    } else {
      await this.col.updateOne({ _id: userId }, {
        $set: {
          email: [email, false],
          lastUpdatedAt: date
        }
      });
    }

    return date;
  }

  async activateEmail(userId: ObjectId, email: string, backup = false) {
    const date = Date.now();

    if (backup) {
      await this.col.updateOne({ _id: userId, 'backupEmail.0': email }, {
        $set: {
          'backupEmail.1': true,
          lastUpdatedAt: date
        }
      });

    } else {
      await this.col.updateOne({ _id: userId, 'email.0': email }, {
        $set: {
          'email.1': true,
          lastUpdatedAt: date
        }
      });
    }

    return date;
  }




  // profile
  // ----------------------------------------------------------------------------------------------------------------
  async updateProfile(userId: ObjectId, profile: UserProfile) {
    const date = Date.now();

    await this.col.updateOne({ _id: userId }, {
      $set: {
        profile: profile,
        lastUpdatedAt: date
      }
    });

    return date;
  }




  // roles
  // ----------------------------------------------------------------------------------------------------------------
  async updateRoles(userId: ObjectId, roles: Role[]) {
    const date = Date.now();

    await this.col.updateOne({ _id: userId }, {
      $set: { roles, lastUpdatedAt: date }
    });

    return date;
  }




  // organziation
  // ----------------------------------------------------------------------------------------------------------------
  async updateOrganziation(userId: ObjectId, organization: ObjectId) {
    const date = Date.now();

    await this.col.updateOne({ _id: userId }, {
      $set: { organization, lastUpdatedAt: date }
    });

    return date;
  }




  // activation
  // ----------------------------------------------------------------------------------------------------------------
  async activate(userId: ObjectId) {
    const date = Date.now();

    await this.col.updateOne({ _id: userId }, {
      $set: { active: true, lastUpdatedAt: date }
    });

    return date;
  }

  async deactivate(userId: ObjectId) {
    const date = Date.now();

    await this.col.updateOne({ _id: userId }, {
      $set: { active: false, lastUpdatedAt: date }
    });

    return date;
  }
}

export default new UsersModel();