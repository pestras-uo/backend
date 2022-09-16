import { getByRowId, getChildren } from "../..";
import oracle from "../../../db/oracle"
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { Category } from "./interface";
import Serial from '../../../util/serial';

const TABLE_NAME = 'categories';

export default {

  async get(id: number) {
    return (await oracle.exec<Category>(`
    
      SELECT *
      FROM ${TABLE_NAME}
      WHERE id = :a
    
    `, [id])).rows?.[0] || null;
  },

  async getAll() {
    return (await oracle.exec<Category>(`
    
      SELECT *
      FROM ${TABLE_NAME}
    
    `)).rows || [];
  },

  async nameExists(name_ar: string, name_en: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*) as COUNT
      FROM ${TABLE_NAME}
      WHERE name_ar = :a OR name_en = :b
    
    `, [name_ar, name_en])).rows?.[0].COUNT! > 0;
  },

  async updateNameExists(id: number, name_ar: string, name_en: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*) as COUNT
      FROM ${TABLE_NAME}
      WHERE (name_ar = :a OR name_en = :b) AND id <> :c
    
    `, [name_ar, name_en, id])).rows?.[0].COUNT! > 0;
  },




  // create
  // ----------------------------------------------------------------------------
  async create(name_ar: string, name_en: string, parent?: string) {
    if (await this.nameExists(name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const siblings = !!parent ? [] : await getChildren(TABLE_NAME, parent!);
    const serial = Serial.gen(parent, siblings);

    const result = await oracle.exec(`
    
      INSERT INTO ${TABLE_NAME} (serial, name_ar, name_en)
      VALUES (:a, :b, :d)
    
    `, [serial, name_ar, name_en]);

    return getByRowId<Category>(TABLE_NAME, result.lastRowid!);
  },




  // update
  // ----------------------------------------------------------------------------
  async update(id: number, name_ar: string, name_en: string) {
    if (await this.updateNameExists(id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const date = new Date();

    await oracle.exec(`
    
      UPDAET ${TABLE_NAME}
      SET name_ar = :a, name_en = :b, update_date = :c
      WHERE id = :d
    
    `, [name_ar, name_en, date, id]);

    return date;
  },




  // delete methods
  // ----------------------------------------------------------------------------------------------------------------
  async delete(id: number) {
    await oracle.exec(`
      DELETE FROM ${TABLE_NAME}
      WHERE id = :id
    `, [id]);

    return true;
  }
}