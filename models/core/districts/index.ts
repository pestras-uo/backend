import { getByRowId } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { Category } from "../../misc/categories/interface";
import { District } from "./interface";
import { randomUUID } from 'crypto';

const TABLE_NAME = 'districts';

export default {
  async getAll() {
    return (await oracle.exec<District>(`
    
      SELECT *
      FROM ${TABLE_NAME}
    
    `)).rows || [];
  },

  async get(id: string) {
    return (await oracle.exec<District>(`
    
      SELECT *
      FROM ${TABLE_NAME}
      WHERE id = :a
    
    `, [id])).rows?.[0] || null;
  },

  async nameExists(name_ar: string, name_en: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TABLE_NAME}
      WHERE name_ar = :a, name_en = :b
    
    `, [name_ar, name_en])).rows?.[0].COUNT! > 0;
  },

  async updateNameExists(id: string, name_ar: string, name_en: string) {
    return (await oracle.exec<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${TABLE_NAME}
      WHERE (name_ar = :a, name_en = :b) AND id = :c
    
    `, [name_ar, name_en, id])).rows?.[0].COUNT! > 0;
  },

  async create(name_ar: string, name_en: string) {
    if (await this.nameExists(name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, 'nameAlreadyExists');

    const id = randomUUID();

    const result = await oracle.exec(`
    
      INSERT INTO ${TABLE_NAME} (id, name_ar, name_en)
      VALUES (:a, :b, :c)

    `, [id, name_ar, name_en]);

    return getByRowId<Category>(TABLE_NAME, result.lastRowid!);
  },

  async update(id: string, name_ar: string, name_en: string) {
    if (await this.updateNameExists(id, name_ar, name_en))
      throw new HttpError(HttpCode.CONFLICT, 'nameAlreadyExists');

    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET name_ar = :a, name_en = :b, update_date = :c
      WHERE id = :d
    
    `, [name_ar, name_en, date, id]);

    return date;
  }
}