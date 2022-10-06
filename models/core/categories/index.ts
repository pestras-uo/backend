import { getChildren, TablesNames } from "../..";
import oracle from "../../../db/oracle"
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { Category } from "./interface";
import Serial from '../../../util/serial';

export default {

  // getters
  // ------------------------------------------------------------------------
  async get(id: string) {
    return (await oracle.op().query<Category>(`
    
      SELECT id "id", name_ar "name_ar", name_en "name_en"
      FROM ${TablesNames.CATEGORIES}
      WHERE id = :a
    
    `, [id])).rows?.[0] || null;
  },

  async getAll() {
    return (await oracle.op().query<Category>(`
    
      SELECT id "id", name_ar "name_ar", name_en "name_en"
      FROM ${TablesNames.CATEGORIES}
    
    `)).rows || [];
  },




  // util
  // ------------------------------------------------------------------------
  async exists(id: string) {
    return (await oracle.op().query<{ count: number }>(`
    
      SELECT COUNT(*) as 'count'
      FROM ${TablesNames.CATEGORIES}
      WHERE id = :a
    
    `, [id])).rows?.[0].count! > 0;
  },




  // create
  // ----------------------------------------------------------------------------
  async create(name_ar: string, name_en: string, parent?: string) {
    const siblings = !!parent ? [] : await getChildren(TablesNames.CATEGORIES, parent!);
    const id = Serial.gen(parent, siblings);

    await oracle.op()
      .write(`
      
        INSERT INTO ${TablesNames.CATEGORIES} (id, name_ar, name_en)
        VALUES (:a, :b, :d)
      
      `, [id, name_ar, name_en])
      .commit();

    return { id: id, name_ar: name_ar, name_en: name_en } as Category;
  },




  // update
  // ----------------------------------------------------------------------------
  async update(id: string, name_ar: string, name_en: string) {
    if (!(await this.exists(id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'categoryNotFound');

    await oracle.op()
      .write(`
      
        UPDAET ${TablesNames.CATEGORIES}
        SET name_ar = :a, name_en = :b
        WHERE id = :c
      
      `, [name_ar, name_en, id])
      .commit();

    return true;
  },




  // delete methods
  // ----------------------------------------------------------------------------------------------------------------
  async delete(id: string) {
    await oracle.op()
      .write(`
        DELETE FROM ${TablesNames.CATEGORIES}
        WHERE id = :id
      `, [id])
      .commit();

    return true;
  }
}