import { User, UserDetailsQueryResultItem, UserDetails } from './interface';
import oracle from '../../../db/oracle';
import { HttpError } from '../../../misc/errors';
import { HttpCode } from '../../../misc/http-codes';
import { getByRowId, TablesNames } from '../..';
import { omit } from '../../../util/pick-omit';
import { Group } from '../groups/interface';
import { randomUUID } from 'crypto';

export default {


  // util methods
  // ----------------------------------------------------------------------------------------------------------------
  async exists(id: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(0) as COUNT
      FROM ${TablesNames.USERS}
      WHERE id = :id
    
    `, [id])).rows?.[0].COUNT! > 0;
  },

  async usernameExists(username: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(0) as COUNT
      FROM ${TablesNames.USERS}
      WHERE username = :username
    
    `, [username])).rows?.[0].COUNT! > 0;
  },




  // getters
  // ----------------------------------------------------------------------------------------------------------------
  async get(id: string) {
    const result = (await oracle.exec<UserDetailsQueryResultItem>(`
    
      SELECT 
        U.*,
        UG.GROUP_ID GROUP_ID,
        UR.ROLE_ID ROLE_ID
      FROM 
        ${TablesNames.USERS} U
      LEFT JOIN
        ${TablesNames.USER_GROUP} UG ON UG.USER_ID = U.ID
      LEFT JOIN
        ${TablesNames.USER_ROLE} UR ON UR.USER_ID = U.ID
      WHERE
        U.ID = :a
    
    `, [id])).rows || [];

    if (result.length === 0)
      return null;

    const user = omit<UserDetails, UserDetailsQueryResultItem>(result[0], ['GROUP_ID', 'ROLE_ID']);

    const groups = new Set<string>();
    const roles = new Set<number>();

    for (const rec of result) {
      !!rec.GROUP_ID && groups.add(rec.GROUP_ID);
      typeof rec.ROLE_ID === 'number' && roles.add(rec.ROLE_ID);
    }

    user.GROUPS = Array.from(groups);
    user.ROLES = Array.from(roles);

    return user;
  },

  async getByUsername(username: string) {
    const result = (await oracle.exec<UserDetailsQueryResultItem>(`
    
      SELECT 
        U.*,
        UG.GROUP_ID GROUP_ID,
        UR.ROLE_ID ROLE_ID
      FROM 
        ${TablesNames.USERS} U
      LEFT JOIN
        ${TablesNames.USER_GROUP} UG ON UG.USER_ID = U.ID
      LEFT JOIN
        ${TablesNames.USER_ROLE} UR ON UR.USER_ID = U.ID
      WHERE
        U.USERNAME = :a
    
    `, [username])).rows || [];

    if (result.length === 0)
      return null;

    const user = omit<UserDetails, UserDetailsQueryResultItem>(result[0], ['GROUP_ID', 'ROLE_ID']);

    const groups = new Set<string>();
    const roles = new Set<number>();

    for (const rec of result) {
      !!rec.GROUP_ID && groups.add(rec.GROUP_ID);
      typeof rec.ROLE_ID === 'number' && roles.add(rec.ROLE_ID);
    }

    user.GROUPS = Array.from(groups);
    user.ROLES = Array.from(roles);

    return user;
  },

  async getByOrgunit(orgunit_id: string, is_active = 1) {
    return (await oracle.exec<User>(`
    
      SELECT *
      FROM ${TablesNames.USERS}
      WHERE orgunit_id = :a AND is_active = :b
  
  `, [orgunit_id, is_active])).rows || [];
  },

  async getAll(is_active = 1) {
    return (await oracle.exec<User>(`
    
      SELECT *
      FROM ${TablesNames.USERS}
      WHERE is_active = :b
  
  `, [is_active])).rows || [];
  },




  // create
  // ----------------------------------------------------------------------------------------------------------------
  async create(orgunit_id: string, username: string) {
    if (await this.usernameExists(username))
      throw new HttpError(HttpCode.CONFLICT, "usernameAlreadyExists");

    const id = randomUUID();

    const result = await oracle.exec(`
    
      INSERT INTO ${TablesNames.USERS} (id, orgunit_id, username)
      VALUES (:a, :b, :c)
    
    `, [id, orgunit_id, username]);

    return getByRowId<User>(TablesNames.USERS, result.lastRowid!);
  },




  // username
  // ----------------------------------------------------------------------------------------------------------------
  async updateUsername(user_id: string, username: string) {
    const date = new Date();

    if (await this.usernameExists(username))
      throw new HttpError(HttpCode.CONFLICT, "usernameAlreadyExists");

    await oracle.exec(`
    
      UPDATE ${TablesNames.USERS}
      SET username = :a, update_date = :b
      WHERE id = :c
    
    `, [username, date, user_id])

    return date;
  },




  // update
  // ----------------------------------------------------------------------------------------------------------------
  async updateAvatar(user_id: string, avatar: string) {
    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TablesNames.USERS}
      SET avatar = :a, update_date = :b
      WHERE id = :c
  
  `, [avatar, date, user_id])

    return date;
  },

  async updateProfile(user_id: string, fullname: string, email: string, mobile: string) {
    const date = new Date();

    console.log([fullname, email, mobile, date, user_id]);

    await oracle.exec(`
    
      UPDATE ${TablesNames.USERS}
      SET fullname = :a, email = :b, mobile = :c, update_date = :d
      WHERE id = :e
  
  `, [fullname, email, mobile, date, user_id]);

    return date;
  },




  // roles
  // ----------------------------------------------------------------------------------------------------------------
  async getRoles(user_id: string) {
    return (await oracle.exec(`
    
      SELECT *
      FROM ${TablesNames.USER_ROLE}
      WHERE user_id = :a
    
    `, [user_id])).rows || [];
  },

  async assignRole(user_id: string, role_id: string) {
    await oracle.exec(`
    
      INSERT INTO ${TablesNames.USER_ROLE} (user_id, role_id)
      VALUES (:a, :b)

    `, [user_id, role_id])

    return true;
  },

  async assignRoles(user_id: string, roles: number[]) {
    if (roles.length === 0)
      return true;

    await oracle.execMany(`
    
      INSERT INTO ${TablesNames.USER_ROLE} (user_id, role_id)
      VALUES (:a, :b)

    `, roles.map(r => [user_id, r]));

    return true;
  },

  async removeRole(user_id: string, role_id: string) {
    await oracle.exec(`
    
      DELETE FROM ${TablesNames.USER_ROLE}
      WHERE user_id = :a, role_id = :b

    `, [user_id, role_id])

    return true;
  },

  async removeAllRoles(user_id: string) {
    await oracle.exec(`
    
      DELETE FROM ${TablesNames.USER_ROLE}
      WHERE user_id = :a

    `, [user_id]);

    return true;
  },





  // groups
  // ----------------------------------------------------------------------------------------------------------------
  async getGroups(user_id: string) {
    return (await oracle.exec<Group>(`
    
      SELECT G.*
      FROM ${TablesNames.GROUPS} G, ${TablesNames.USER_GROUP} UG
      WHERE UG.USER_ID = :a AND G.ID = UG.GROUP_ID
    
    `, [user_id])).rows || [];
  },


  async assignGroup(user_id: string, group_id: string) {
    await oracle.exec(`
    
      INSERT INTO ${TablesNames.USER_GROUP} (user_id, group_id)
      VALUES (:a, :b)

    `, [user_id, group_id])

    return true;
  },

  async assignGroups(user_id: string, groups: string[]) {
    if (groups.length === 0)
      return true;

    await oracle.execMany(`
    
      INSERT INTO ${TablesNames.USER_GROUP} (user_id, group_id)
      VALUES (:a, :b)

    `, groups.map(r => [user_id, r]));

    return true;
  },

  async removeGroup(user_id: string, group_id: string) {
    await oracle.exec(`
    
      DELETE FROM ${TablesNames.USER_GROUP}
      WHERE user_id = :a, group_id = :b

    `, [user_id, group_id])

    return true;
  },

  async removeAllGroups(user_id: string) {
    await oracle.exec(`
    
      DELETE FROM ${TablesNames.USER_GROUP}
      WHERE user_id = :a

    `, [user_id]);

    return true;
  },




  // orgunits
  // ----------------------------------------------------------------------------------------------------------------
  async updateOrgunit(user_id: string, orgunit_id: string) {
    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TablesNames.USERS}
      SET orgunit_id = :a, update_date = :b
      WHERE id = :c
    
    `, [orgunit_id, date, user_id])

    return date;
  },




  // activation
  // ----------------------------------------------------------------------------------------------------------------
  async activate(user_id: string, state = 1) {
    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TablesNames.USERS}
      SET is_active = :a, update_date = :b
      WHERE id = :c
    
    `, [state, date, user_id])

    return date;
  }
}