import { DBUser, User } from './interface';
import oracle from '../../../db/oracle';
import { HttpError } from '../../../misc/errors';
import { HttpCode } from '../../../misc/http-codes';
import { TablesNames } from '../..';
import { omit } from '../../../util/pick-omit';
import { randomUUID } from 'crypto';
import crypt from '../../../auth/crypt';
import { cache } from '../../../cache';

export default {


  // util methods
  // ----------------------------------------------------------------------------------------------------------------
  async exists(id: string) {
    return (await oracle.op().query<{ count: number }>(`
    
      SELECT COUNT(0) as "count"
      FROM ${TablesNames.USERS}
      WHERE id = :id
    
    `, [id])).rows?.[0].count! > 0;
  },

  async usernameExists(username: string) {
    return (await oracle.op().query<{ count: number }>(`
    
      SELECT COUNT(0) as "count"
      FROM ${TablesNames.USERS}
      WHERE username = :username
    
    `, [username])).rows?.[0].count! > 0;
  },




  // getters
  // ----------------------------------------------------------------------------------------------------------------
  async get(id: string) {
    const result = (await oracle.op().query<DBUser>(`
    
      SELECT 
        id "id",
        orgunit_id "orgunit_id", 
        username "username", 
        is_active "is_active",
        roles "roles",
        groups "groups",
        avatar "avatar",
        fullname "fullname",
        email "email",
        mobile "mobile",
        create_date "create_date",
        update_date "update_date"
      FROM 
        ${TablesNames.USERS}
      WHERE
        id = :a
    
    `, [id])).rows[0] || null;

    if (!result)
      return null;

    return {
      ...omit(result, ['roles', 'groups']),
      roles: JSON.parse(result.roles),
      groups: (JSON.parse(result.groups) as string[]).map(g => cache.groups.get(g))
    } as User;
  },

  async getByUsername(username: string) {
    const result = (await oracle.op().query<DBUser>(`
    
      SELECT 
        id "id",
        orgunit_id "orgunit_id", 
        username "username", 
        is_active "is_active",
        roles "roles",
        groups "groups",
        avatar "avatar",
        fullname "fullname",
        email "email",
        mobile "mobile",
        create_date "create_date",
        update_date "update_date"
      FROM 
        ${TablesNames.USERS}
      WHERE
        username = :a
    
    `, [username])).rows[0] || null;

    if (!result)
      return null;

    return {
      ...omit(result, ['roles', 'groups']),
      roles: JSON.parse(result.roles),
      groups: (JSON.parse(result.groups) as string[]).map(g => cache.groups.get(g))
    };
  },

  async getByOrgunit(orgunit_id: string, is_active = 1) {
    return ((await oracle.op().query<DBUser>(`
    
      SELECT 
        id "id",
        orgunit_id "orgunit_id", 
        username "username", 
        is_active "is_active",
        roles "roles",
        groups "groups",
        avatar "avatar",
        fullname "fullname",
        email "email",
        mobile "mobile",
        create_date "create_date",
        update_date "update_date"
      FROM 
        ${TablesNames.USERS}
      WHERE
        orgunit_id = :a AND is_active = :b
  
  `, [orgunit_id, is_active])).rows || [])
      .map(u => ({
        ...omit(u, ['roles', 'groups']),
        roles: JSON.parse(u.roles),
        groups: (JSON.parse(u.groups) as string[]).map(g => cache.groups.get(g))
      }));
  },

  async getAll(is_active = 1) {
    return ((await oracle.op().query<DBUser>(`
    
      SELECT 
        id "id",
        orgunit_id "orgunit_id", 
        username "username", 
        is_active "is_active",
        roles "roles",
        groups "groups",
        avatar "avatar",
        fullname "fullname",
        email "email",
        mobile "mobile",
        create_date "create_date",
        update_date "update_date"
      FROM
        ${TablesNames.USERS}
      WHERE
        is_active = :b
  
  `, [is_active])).rows || [])
      .map(u => ({
        ...omit(u, ['roles', 'groups']),
        roles: JSON.parse(u.roles),
        groups: (JSON.parse(u.groups) as string[]).map(g => cache.groups.get(g))
      })) as User[];
  },




  // create
  // ----------------------------------------------------------------------------------------------------------------
  async create(orgunit_id: string, username: string, password: string, roles: number[], groups: string[]) {
    if (await this.usernameExists(username))
      throw new HttpError(HttpCode.CONFLICT, "usernameAlreadyExists");

    const id = randomUUID();
    const [hashed, salt] = await crypt.hash(password);

    await oracle.op()
      .write(`
    
        INSERT INTO ${TablesNames.USERS} (id, orgunit_id, username, roles, groups)
        VALUES (:a, :b, :c, :d, :e)
      
      `, [id, orgunit_id, username, JSON.stringify(roles), JSON.stringify(groups)])
      .write(`
      
        INSERT INTO ${TablesNames.AUTH} (user_id, password, salt)
        VALUES (:a, :b, :c)
      
      `, [id, hashed, salt])
      .commit();

    return this.get(id);
  },




  // username
  // ----------------------------------------------------------------------------------------------------------------
  async updateUsername(user_id: string, username: string) {
    const date = new Date();

    if (!(await this.exists(user_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'userNotFound');

    if (await this.usernameExists(username))
      throw new HttpError(HttpCode.CONFLICT, "usernameAlreadyExists");

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.USERS}
        SET username = :a, update_date = :b
        WHERE id = :c
      
      `, [username, date, user_id])
      .commit();

    return date;
  },




  // update
  // ----------------------------------------------------------------------------------------------------------------
  async updateAvatar(user_id: string, avatar: string) {
    const date = new Date();

    if (!(await this.exists(user_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'userNotFound');

    await oracle.op()
      .write(`
    
        UPDATE ${TablesNames.USERS}
        SET avatar = :a, update_date = :b
        WHERE id = :c
    
      `, [avatar, date, user_id])
      .commit();

    return date;
  },

  async updateProfile(user_id: string, fullname: string, email: string, mobile: string) {
    const date = new Date();

    if (!(await this.exists(user_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'userNotFound');

    await oracle.op()
      .write(`
    
        UPDATE ${TablesNames.USERS}
        SET fullname = :a, email = :b, mobile = :c, update_date = :d
        WHERE id = :e
    
      `, [fullname, email, mobile, date, user_id])
      .commit();

    return date;
  },




  // roles
  // ---------------------------------------------------------------------------------------------------------------
  async updateRoles(user_id: string, roles: number[]) {

    if (!(await this.exists(user_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'userNotFound');

    await oracle.op()
      .writeMany(`
      
        UPDATE ${TablesNames.USERS}
        SET roles = :a
        WHERE id = :b
      
      `, [JSON.stringify(roles), user_id])
      .commit();

    return true;
  },





  // groups
  // ----------------------------------------------------------------------------------------------------------------
  async updateGroups(user_id: string, groups: string[]) {

    if (!(await this.exists(user_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'userNotFound');

    await oracle.op()
      .writeMany(`
      
        UPDATE ${TablesNames.USERS}
        SET groups = :a
        WHERE id = :b
      
      `, [JSON.stringify(groups), user_id])
      .commit();

    return true;
  },




  // orgunits
  // ----------------------------------------------------------------------------------------------------------------
  async updateOrgunit(user_id: string, orgunit_id: string) {

    if (!(await this.exists(user_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'userNotFound');

    const date = new Date();

    await oracle.op()
      .write(`
    
        UPDATE ${TablesNames.USERS}
        SET orgunit_id = :a, update_date = :b
        WHERE id = :c
      
      `, [orgunit_id, date, user_id])
      .commit();

    return date;
  },




  // activation
  // ----------------------------------------------------------------------------------------------------------------
  async activate(user_id: string, state = 1) {

    if (!(await this.exists(user_id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'userNotFound');

    const date = new Date();

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.USERS}
        SET is_active = :a, update_date = :b
        WHERE id = :c
      
      `, [state, date, user_id])
      .commit();

    return date;
  }
}