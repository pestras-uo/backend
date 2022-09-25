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
    return (await oracle.op().read<Category>(`
    
      SELECT *
      FROM ${TablesNames.CATEGORIES}
      WHERE id = :a
    
    `, [id])).rows?.[0] || null;
  },

  async getAll() {
    return (await oracle.op().read<Category>(`
    
      SELECT *
      FROM ${TablesNames.CATEGORIES}
    
    `)).rows || [];
  },




  // util
  // ------------------------------------------------------------------------
  async exists(id: string) {
    return (await oracle.op().read<{ COUNT: number }>(`
    
      SELECT COUNT(*) as COUNT
      FROM ${TablesNames.CATEGORIES}
      WHERE id = :a
    
    `, [id])).rows?.[0].COUNT! > 0;
  },

  async nameExists(name_ar: string, name_en: string) {
    return (await oracle.op().read<{ COUNT: number }>(`
    
      SELECT COUNT(*) as COUNT
      FROM ${TablesNames.CATEGORIES}
      WHERE name_ar = :a OR name_en = :b
    
    `, [name_ar, name_en])).rows?.[0].COUNT! > 0;
  },

  async updateNameExists(id: string, name_ar: string, name_en: string) {
    return (await oracle.op().read<{ COUNT: number }>(`
    
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

    await oracle.op()
      .write(`
      
        INSERT INTO ${TablesNames.CATEGORIES} (id, name_ar, name_en)
        VALUES (:a, :b, :d)
      
      `, [id, name_ar, name_en])
      .commit();

    return { ID: id, NAME_AR: name_ar, NAME_EN: name_en } as Category;
  },




  // update
  // ----------------------------------------------------------------------------
  async update(id: string, name_ar: string, name_en: string) {
    if (await this.updateNameExists(id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

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