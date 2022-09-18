import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { Orgunit } from "./interface";
import Serial from '../../../util/serial';
import { getByRowId, getChildren } from "../..";

const TABLE_NAME = 'organizations';

export default {

  // Getters
  // ----------------------------------------------------------------------------
  async getAll() {
    return (await oracle.exec<Orgunit>(`

      SELECT * 
      FROM ${TABLE_NAME}

    `)).rows || [];
  },

  async get(id: string) {
    return (await oracle.exec<Orgunit>(`

      SELECT *
      FROM ${TABLE_NAME}
      WHERE id = :id

    `, [id])).rows?.[0] || null;
  },




  // Util
  // ----------------------------------------------------------------------------
  async exists(id: string) {
   return (await oracle.exec<{ count: number }>(`

      SELECT COUNT(id) as count
      FROM ${TABLE_NAME}
      WHERE id = :id

    `, [id])).rows?.[0].count! > 0;
  },

  async nameExists(name_ar: string, name_en: string) {
   return (await oracle.exec<{ COUNT: number }>(`

      SELECT COUNT(name) as count
      FROM ${TABLE_NAME}
      WHERE name_ar = :name_ar OR name_en = :name_en

    `, [name_ar, name_en])).rows?.[0].COUNT! > 0;
  },

  async updatedNameExists(id: string, name_ar: string, name_en: string) {
   return (await oracle.exec<{ count: number }>(`

      SELECT COUNT(name) as count
      FROM ${TABLE_NAME}
      WHERE (name_ar = :name_ar OR name_en = :name_en) AND id <> :id

    `, [name_ar, name_en, id])).rows?.[0].count! > 0;
  },




  // create
  // ----------------------------------------------------------------------------
  async create(name_ar: string, name_en: string, parent?: string) {
    if (await this.nameExists(name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const siblings = !!parent ? [] : await getChildren(TABLE_NAME, parent!);
    const id = Serial.gen(parent, siblings);

    const result = await oracle.exec(`

      INSERT INTO ${TABLE_NAME} (id, name_ar, name_en)
      VALUES (:a, :b, :c)

    `, [
      id,
      name_ar,
      name_en
    ]);

    return getByRowId<Orgunit>(TABLE_NAME, result.lastRowid!);
  },




  // update
  // ----------------------------------------------------------------------------
  async update(id: string, name_ar: string, name_en: string) {
    if (await this.updatedNameExists(id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET name_ar = :a, name_en = :b, update_date = :c
      WHERE id = :d
    
    `, [name_ar, name_en, date, id]);

    return date;
  }
}