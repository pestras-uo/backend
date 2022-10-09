import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { DBGroup, Group } from "./interface";
import { randomUUID } from 'crypto';
import { TablesNames } from "../..";
import { omit } from "../../../util/pick-omit";
import { Role } from "../../../auth/roles";

export default {

  // getters
  // ----------------------------------------------------------------------------------------------------------------
  async get(id: string) {
    const group = (await oracle.op().query<DBGroup>(`

      SELECT
        id "id",
        orgunit_id "orgunit_id",
        name_ar "name_ar", 
        name_en "name_en",
        roles "roles"
      FROM
        ${TablesNames.GROUPS}
      WHERE id = :id

    `, [id])).rows[0] || null;

    if (group)
      return null;

    return { ...omit(group, ['roles']), roles: JSON.stringify(group.roles) as unknown as Role[] } as Group;
  },

  async getAll() {
    return ((await oracle.op().query<DBGroup>(`

      SELECT
        id "id",
        orgunit_id "orgunit_id",
        name_ar "name_ar", 
        name_en "name_en",
        roles "roles"
      FROM
        ${TablesNames.GROUPS}

    `)).rows || [])
      .map(g => ({ ...omit(g, ['roles']), roles: JSON.stringify(g.roles) as unknown as Role[] } as Group));
  },

  async getMany(ids: string[]) {
    return ((await oracle.op().query<DBGroup>(`
    
      SELECT
        id "id",
        orgunit_id "orgunit_id",
        name_ar "name_ar", 
        name_en "name_en",
        roles "roles"
      FROM
        ${TablesNames.GROUPS}
      WHERE
        id IN (${ids.map((_, i) => `:a${i}`)})
    
    `, ids)).rows || [])
      .map(g => ({ ...omit(g, ['roles']), roles: JSON.stringify(g.roles) as unknown as Role[] } as Group));
  },





  // util
  // ----------------------------------------------------------------------------------------------------------------
  async exists(id: string) {
    return (await oracle.op().query<{ count: number }>(`
    
      SELECT COUNT(*) as "count"
      FROM ${TablesNames.GROUPS}
      WHERE id = :a
    
    `, [id])).rows?.[0].count! > 0;
  },

  async idsExists(ids: string[]) {
    const cs_id = ids.reduce((str: string, id: string) => str ? `${str}, ${id}` : str, '');
    return (await oracle.op().query<{ count: number }>(`
    
      SELECT COUNT(*) as "count"
      FROM ${TablesNames.GROUPS}
      WHERE id IN :a
    
    `, [cs_id])).rows?.[0].count === ids.length;
  },





  // create
  // ----------------------------------------------------------------------------------------------------------------
  async create(orgunit_id: string, name_ar: string, name_en: string, roles: Role[]) {
    const id = randomUUID();

    await oracle.op()
      .write(`
    
        INSERT INTO ${TablesNames.GROUPS} (id, orgunit_id, name_ar, name_en, roles)
        VALUES (:a, :b, :c, :d, :e)

      `, [id, orgunit_id, name_ar, name_en, JSON.stringify(roles)])
      .commit();

    return { id, orgunit_id, name_ar: name_ar, name_en: name_en, roles } as Group;
  },





  // update
  // ----------------------------------------------------------------------------------------------------------------
  async update(id: string, name_ar: string, name_en: string) {
    if (!(await this.exists(id)))
      throw new HttpError(HttpCode.NOT_FOUND, "groupNotFound");

    await oracle.op()
      .write(`
    
        UPDATE ${TablesNames.GROUPS}
        SET name_ar = :a, name_en = :b
        WHERE id = :c

      `, [name_ar, name_en, id])
      .commit();

    return true;
  },





  // update roles
  // ----------------------------------------------------------------------------------------------------------------
  async updateRoles(id: string, roles: Role[]) {
    if (!(await this.exists(id)))
      throw new HttpError(HttpCode.NOT_FOUND, "groupNotFound");

    await oracle.op()
      .write(`
    
        UPDATE ${TablesNames.GROUPS}
        SET roles = :a
        WHERE id = :b

      `, [JSON.stringify(roles), id])
      .commit();

    return true;
  },





  // update orgunit
  // ----------------------------------------------------------------------------------------------------------------
  async updateGroupOrgunit(group_id: string, orgunit_id: string) {
    if (!(await this.exists(group_id)))
      throw new HttpError(HttpCode.NOT_FOUND, "groupNotFound");

    await oracle.op()
      .write(`
    
        UPDATE ${TablesNames.GROUPS}
        SET orgunit_id = :a
        WHERE id = :b
      
      `, [orgunit_id, group_id])
      .commit();

    return true;
  },




  // delete group
  // ----------------------------------------------------------------------------------------------------------------
  async deleteGroup(group_id: string) {
    await oracle.op()
      .write(`
      
        DELETE FROM ${TablesNames.GROUPS}
        WHERE id = :a
      
      `, [group_id])
      .commit();

    return true;
  }
}