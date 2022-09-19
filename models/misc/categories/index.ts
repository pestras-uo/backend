import { getByRowId, getChildren, TablesNames } from "../..";
import oracle from "../../../db/oracle"
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { Category } from "./interface";
import Serial from '../../../util/serial';

export default {

  async get(id: string) {
    return (await oracle.exec<Category>(`
    
      SELECT *
      FROM ${TablesNames.CATEGORIES}
      WHERE id = :a
    
    `, [id])).rows?.[0] || null;
  },

  async getAll() {
    return (await oracle.exec<Category>(`
    
      SELECT *
      FROM ${TablesNames.CATEGORIES}
    
    `)).rows || [];
  },

  async nameExists(name_ar: string, name_en: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*) as COUNT
      FROM ${TablesNames.CATEGORIES}
      WHERE name_ar = :a OR name_en = :b
    
    `, [name_ar, name_en])).rows?.[0].COUNT! > 0;
  },

  async updateNameExists(id: string, name_ar: string, name_en: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*) as COUNT
      FROM ${TablesNames.CATEGORIES}
      WHERE (name_ar = :a OR name_en = :b) AND id <> :c
    
    `, [name_ar, name_en, id])).rows?.[0].COUNT! > 0;
  },




  // create
  // ----------------------------------------------------------------------------
  async create(name_ar: string, name_en: string, parent?: string) {
    if (await this.nameExists(name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const siblings = !!parent ? [] : await getChildren(TablesNames.CATEGORIES, parent!);
    const id = Serial.gen(parent, siblings);

    const result = await oracle.exec(`
    
      INSERT INTO ${TablesNames.CATEGORIES} (id, name_ar, name_en)
      VALUES (:a, :b, :d)
    
    `, [id, name_ar, name_en]);

    return getByRowId<Category>(TablesNames.CATEGORIES, result.lastRowid!);
  },




  // update
  // ----------------------------------------------------------------------------
  async update(id: string, name_ar: string, name_en: string) {
    if (await this.updateNameExists(id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const date = new Date();

    await oracle.exec(`
    
      UPDAET ${TablesNames.CATEGORIES}
      SET name_ar = :a, name_en = :b
      WHERE id = :c
    
    `, [name_ar, name_en, id]);

    return true;
  },




  // delete methods
  // ----------------------------------------------------------------------------------------------------------------
  async delete(id: string) {
    await oracle.exec(`
      DELETE FROM ${TablesNames.CATEGORIES}
      WHERE id = :id
    `, [id]);

    return true;
  }
}