import { getChildren, TablesNames } from "../..";
import oracle from "../../../db/oracle"
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { Category, CategoryType } from "./interface";
import Serial from '../../../util/serial';

export default {

  // getters
  // ------------------------------------------------------------------------
  async get(id: string) {
    return (await oracle.op().query<Category>(`
    
      SELECT id "id", name_ar "name_ar", name_en "name_en", type "type"
      FROM ${TablesNames.CATEGORIES}
      WHERE id = :a
    
    `, [id])).rows?.[0] || null;
  },

  async getAll() {
    return (await oracle.op().query<Category>(`
    
      SELECT id "id", name_ar "name_ar", name_en "name_en", type "type"
      FROM ${TablesNames.CATEGORIES}
    
    `)).rows || [];
  },

  async getCategoryChildren(id: string) {
    return (await oracle.op().query<Category>(`
    
      SELECT id "id", name_ar "name_ar", name_en "name_en"
      FROM ${TablesNames.CATEGORIES}
      WHERE type = :a AND REGEXP_LIKE (id, '^${id}_')
    
    `, [CategoryType.READING])).rows || [];
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
  async create(name_ar: string, name_en: string, type: CategoryType, parent?: string) {
    const siblings = await getChildren(TablesNames.CATEGORIES, parent);
    const id = Serial.gen(parent, siblings);

    await oracle.op()
      .write(`
      
        INSERT INTO ${TablesNames.CATEGORIES} (id, name_ar, name_en, type)
        VALUES (:a, :b, :c, :d)
      
      `, [id, name_ar, name_en, type])
      .commit();

    return { id: id, name_ar: name_ar, name_en: name_en, type } as Category;
  },

  async createBulk(name_ar: string, name_en: string, children: { id?: string; name_ar: string; name_en: string; }[]) {
    const siblings = await getChildren(TablesNames.CATEGORIES, '');
    const id = Serial.gen('', siblings);
    const childrenIds: string[] = [];

    for (const child of children) {
      child.id = Serial.gen(id, childrenIds);
      childrenIds.push(child.id);
    }

    children.push({ id, name_ar, name_en })

    await oracle.op()
      .writeMany(`
      
        INSERT INTO ${TablesNames.CATEGORIES} (
          id, name_ar, name_en, type
        ) VALUES (:a, :b, :c, :d)
      
      `, children.map(c => [c.id, c.name_ar, c.name_en, CategoryType.READING]))
      .commit();

    return id;
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
        WHERE id LIKE :a
      `, [`${id}%`])
      .commit();

    return true;
  }
}