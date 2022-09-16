import { User, UserDetailsQueryResultItem, UserDetails } from './interface';
import oracle from '../../../db/oracle';
import { HttpError } from '../../../misc/errors';
import { HttpCode } from '../../../misc/http-codes';
import { getByRowId } from '../..';
import { omit } from '../../../util/pick-omit';

const TABLE_NAME = 'users';

export default {


  // util methods
  // ----------------------------------------------------------------------------------------------------------------
  async exists(id: number) {
    return (await oracle.exec<{ count: number }>(`
    
      SELECT COUNT(0) as count
      FROM ${TABLE_NAME}
      WHERE id = :id
    
    `, [id])).rows?.[0].count! > 0;
  },

  async usernameExists(username: string) {
    return (await oracle.exec<{ count: number }>(`
    
      SELECT COUNT(0) as count
      FROM ${TABLE_NAME}
      WHERE username = :username
    
    `, [username])).rows?.[0].count! > 0;
  },




  // getters
  // ----------------------------------------------------------------------------------------------------------------
  async get(id: number) {
    const result = (await oracle.exec<UserDetailsQueryResultItem>(`
    
      SELECT 
        U.*,
        G.ID GROUP_ID,
        R.ID ROLE_ID
      FROM 
        USERS U,
        USER_GROUP UG,
        GROUPS G,
        USER_ROLE UR,
        ROLES R
      WHERE
        U.ID = :a
        AND U.ID = UG.USER_ID
        AND G.ID = UG.GROUP_ID
        AND U.ID = UR.USER_ID
        AND R.ID = UR.ROLE_ID
    
    `, [id])).rows || [];

    if (result.length === 0)
      return null;

    const user = omit<UserDetails, UserDetailsQueryResultItem>(result[0], ['GROUP_ID', 'ROLE_ID']);

    const groups = new Set<number>();
    const roles = new Set<number>();

    for (const rec of result) {
      groups.add(rec.GROUP_ID);
      roles.add(rec.ROLE_ID);
    }

    user.GROUPS = Array.from(groups);
    user.ROLES = Array.from(roles);
    
    return user;
  },

  async getByUsername(username: string) {
    return (await oracle.exec<User>(`
    
      SELECT *
      FROM ${TABLE_NAME}
      WHERE username = :username
    
    `, [username])).rows?.[0] || null;
  },

  async getByOranization(organization_id: string, is_active = 1) {
    return (await oracle.exec<User>(`
    
      SELECT *
      FROM ${TABLE_NAME}
      WHERE organization_id = :a AND is_active = :b
  
  `, [organization_id, is_active])).rows || [];
  },

  async getAll(is_active = 1) {
    return (await oracle.exec<User>(`
    
      SELECT *
      FROM ${TABLE_NAME}
      WHERE is_active = :b
  
  `, [is_active])).rows || [];
  },




  // create
  // ----------------------------------------------------------------------------------------------------------------
  async create(orgunit_id: number, username: string) {
    if (await this.usernameExists(username))
      throw new HttpError(HttpCode.CONFLICT, "usernameAlreadyExists");

    const result = await oracle.exec(`
    
      INSERT INTO ${TABLE_NAME} (orgunit_id, username)
      VALUES (:a, :b)
    
    `, [orgunit_id, username]);

    return getByRowId<User>(TABLE_NAME, result.lastRowid!);
  },




  // username
  // ----------------------------------------------------------------------------------------------------------------
  async updateUsername(user_id: number, username: string) {
    const date = Date.now();

    if (await this.usernameExists(username))
      throw new HttpError(HttpCode.CONFLICT, "usernameAlreadyExists");

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET username = :a, update_date = :b
      WHERE id = :c
    
    `, [username, date, user_id])

    return date;
  },




  // update
  // ----------------------------------------------------------------------------------------------------------------
  async updateAvatar(user_id: number, avatar: number) {
    const date = Date.now();

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET avatar = :a, update_date = :b
      WHERE id = :c
  
  `, [avatar, date, user_id])

    return date;
  },

  async updateProfile(user_id: number, fullname: string, email: string, mobile: string) {
    const date = Date.now();

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET fullname = :a, email = :b, mobile = :c update_date = :d
      WHERE id = :e
  
  `, [fullname, email, mobile, date, user_id])

    return date;
  },




  // roles
  // ----------------------------------------------------------------------------------------------------------------
  async getRoles(user_id: number) {
    return (await oracle.exec(`
    
      SELECT *
      FROM user_role
      WHERE user_id = :a
    
    `, [user_id])).rows || [];
  },

  async assignRole(user_id: number, role_id: number) {
    await oracle.exec(`
    
      INSERT INTO user_role (user_id, role_id)
      VALUES (:a, :b)
      WHERE NOT EXISTS (
        SELECT *
        FROM user_role
        WHERE user_id = :a, role_id = :b
      )

    `, [user_id, role_id])

    return true;
  },

  async assignRoles(user_id: number, roles: number[]) {
    await oracle.execMany(`
    
      INSERT INTO user_role (user_id, role_id)
      VALUES (:a, :b)
      WHERE NOT EXISTS (
        SELECT *
        FROM user_role
        WHERE user_id = :a, role_id = :b
      )

    `, roles.map(r => [user_id, r]));

    return true;
  },

  async removeRole(user_id: number, role_id: number) {
    await oracle.exec(`
    
      DELETE FROM user_role
      WHERE user_id = :a, role_id = :b

    `, [user_id, role_id])

    return true;
  },

  async removeAllRoles(user_id: number) {
    await oracle.exec(`
    
      DELETE FROM user_role
      WHERE user_id = :a

    `, [user_id]);

    return true;
  },





  // groups
  // ----------------------------------------------------------------------------------------------------------------
  async getGroups(user_id: number) {
    return (await oracle.exec(`
    
      SELECT *
      FROM user_group
      WHERE user_id = :a
    
    `, [user_id])).rows || [];
  },


  async assignGroup(user_id: number, group_id: number) {
    await oracle.exec(`
    
      INSERT INTO user_group (user_id, group_id)
      VALUES (:a, :b)

    `, [user_id, group_id])

    return true;
  },

  async removeGroup(user_id: number, group_id: number) {
    await oracle.exec(`
    
      DELETE FROM user_group
      WHERE user_id = :a, group_id = :b

    `, [user_id, group_id])

    return true;
  },




  // organziation
  // ----------------------------------------------------------------------------------------------------------------
  async updateOrgunit(user_id: number, orgunit_id: number) {
    const date = Date.now();

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET orgunit_id = :a, update_date = :b
      WHERE id = :c
    
    `, [orgunit_id, date, user_id])

    return date;
  },




  // activation
  // ----------------------------------------------------------------------------------------------------------------
  async activate(user_id: number, state = 1) {
    const date = Date.now();

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET is_active = :a, update_date = :b
      WHERE id = :c
    
    `, [state, date, user_id])

    return date;
  }
}