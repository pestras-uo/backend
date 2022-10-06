import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { Orgunit } from "./interface";
import Serial from '../../../util/serial';
import { getChildren, TablesNames } from "../..";

export default {

  // Getters
  // ----------------------------------------------------------------------------
  async getAll() {
    return (await oracle.op().query<Orgunit>(`

      SELECT 
        id "id", 
        name_ar "name_ar", 
        name_en "name_en", 
        create_date "create_date",
        update_date "update_date"
      FROM
        ${TablesNames.ORGUNITS}

    `)).rows || [];
  },

  async get(id: string) {
    return (await oracle.op().query<Orgunit>(`

      SELECT 
        id "id", 
        name_ar "name_ar", 
        name_en "name_en", 
        create_date "create_date",
        update_date "update_date"
      FROM
        ${TablesNames.ORGUNITS}
      WHERE
        id = :id

    `, [id])).rows?.[0] || null;
  },




  // Util
  // ----------------------------------------------------------------------------
  async exists(id: string) {
   return (await oracle.op().query<{ count: number }>(`

      SELECT COUNT(id) as "count"
      FROM ${TablesNames.ORGUNITS}
      WHERE id = :id

    `, [id])).rows?.[0].count! > 0;
  },




  // create
  // ----------------------------------------------------------------------------
  async create(name_ar: string, name_en: string, parent?: string) {

    const siblings = !!parent ? [] : await getChildren(TablesNames.ORGUNITS, parent!);
    const id = Serial.gen(parent, siblings);

    await oracle.op()
      .write(`

        INSERT INTO ${TablesNames.ORGUNITS} (id, name_ar, name_en)
        VALUES (:a, :b, :c)

      `, [id, name_ar, name_en])
      .commit();

    return this.get(id);
  },




  // update
  // ----------------------------------------------------------------------------
  async update(id: string, name_ar: string, name_en: string) {
    if (!(await this.exists(id)))
      throw new HttpError(HttpCode.NOT_FOUND, 'orgunitNotFound');

    const date = new Date();

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.ORGUNITS}
        SET name_ar = :a, name_en = :b, update_date = :c
        WHERE id = :d
      
      `, [name_ar, name_en, date, id])
      .commit();

    return date;
  }
}