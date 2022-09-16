import { getByRowId, getChildren } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import Serial from "../../../util/serial";
import { Indicator } from "./interface";

const TABLE_NAME = 'indicators';

async function clearArgs(id: number) {
  return oracle.exec(`
  
    DELETE FROM indicator_arguments
    WHERE indicator_id = :a
  
  `, [id]);
}

async function addArgs(id: number, args: { id: string, variable: string }[]) {
  return oracle.execMany(`
  
    INSERT INTO indicator_arguments (indicator_id, arg_id, variable)
    VALUES (:a, :b, :c)
  
  `, args.map(arg => [id, arg.id, arg.variable]));
}

export default {

  // Getters
  // ----------------------------------------------------------------------------
  async getPage(offset = 0, limit = 100, active = 1) {
    return (await oracle.exec<Indicator>(`

      SELECT * 
      FROM ${TABLE_NAME}
      WHERE is_active = ${active}
      OFFSET :a ROWS
      FETCH NEXT :b ROWS ONLY

    `, [offset, limit])).rows || [];
  },

  async get(id: number) {
    return (await oracle.exec<Indicator>(`

      SELECT *
      FROM ${TABLE_NAME}
      WHERE id = :id

    `, [id])).rows?.[0] || null;
  },

  async getBySerial(serial: string) {
    return (await oracle.exec<Indicator>(`

      SELECT *
      FROM ${TABLE_NAME}
      WHERE serial = :serial

    `, [serial])).rows?.[0] || null;
  },

  async getByTopic(topic_id: number, active = 1) {
    return (await oracle.exec(`

      SELECT *
      FROM indicators
      WHERE topic_id = :a AND is_active = ${active}

    `, [topic_id])).rows || [];
  },




  // Util
  // ----------------------------------------------------------------------------
  async exists(id: number) {
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

  async updatedNameExists(id: number, name_ar: string, name_en: string) {
    return (await oracle.exec<{ count: number }>(`
 
       SELECT COUNT(name) as count
       FROM ${TABLE_NAME}
       WHERE (name_ar = :name_ar OR name_en = :name_en) AND id <> :id
 
     `, [name_ar, name_en, id])).rows?.[0].count! > 0;
  },




  // create
  // ----------------------------------------------------------------------------
  async create(ind: Indicator, parent?: string) {
    if (await this.nameExists(ind.NAME_AR, ind.NAME_EN))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const siblings = !!parent ? [] : await getChildren(TABLE_NAME, parent!);
    const serial = Serial.gen(parent, siblings);

    const result = await oracle.exec(`

      INSERT INTO ${TABLE_NAME} (serial, orgunit_serial, topic_serial, name_ar, name_en, desc_en, desc_ar, unit_ar, unit_en)
      VALUES (:a, :b, :c, :d, :e, :f, :g, :h, :i)

    `, [
      serial,
      ind.ORGUNIT_SERIAL,
      ind.TOPIC_SERIAL,
      ind.NAME_AR,
      ind.NAME_EN,
      ind.DESC_AR,
      ind.DESC_EN,
      ind.UNIT_AR,
      ind.UNIT_EN
    ]);

    return getByRowId<Indicator>(TABLE_NAME, result.lastRowid!);
  },




  // update
  // ----------------------------------------------------------------------------
  async update(id: number, ind: Indicator) {
    if (await this.updatedNameExists(id, ind.NAME_AR, ind.NAME_EN))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET name_ar = :a, name_en = :b, desc_ar = :c, desc_en = :d, unit_ar = :e, unit_en = :f, update_date = :g
      WHERE id = :h

    `, [
      ind.NAME_AR,
      ind.NAME_EN,
      ind.DESC_AR,
      ind.DESC_EN,
      ind.UNIT_AR,
      ind.UNIT_EN,
      date,
      id
    ]);

    return date;
  },




  // Interval
  // ----------------------------------------------------------------------------
  async setInterval(topic_id: number, interval: number) {
    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET interval = :a, update_date = :b
      WHERE id = :c
    
    `, [interval, date, topic_id]);

    return date;
  },




  // Kpi
  // ----------------------------------------------------------------------------
  async setKpi(topic_id: number, min?: number, max?: number) {
    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET kpi_min = :a, kpi_max = :b, update_date = :c
      WHERE id = :d
    
    `, [min || null, max || null, date, topic_id]);

    return date;
  },




  // equation
  // ----------------------------------------------------------------------------
  async setEquation(id: number, eq: string, args: { id: string, variable: string }[]) {
    await clearArgs(id);
    if (args.length > 0)
    await addArgs(id, args);

    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET equation = :a, date = :b
      WHERE id = :c
    
    `, [eq, date, id]);

    return date;
  },




  // organziation
  // ----------------------------------------------------------------------------------------------------------------
  async updateOrganziation(indicator_id: number, orgunit_id: number) {
    const date = Date.now();

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET orgunit_id = :a, update_date = :b
      WHERE id = :c
    
    `, [orgunit_id, date, indicator_id])

    return date;
  },




  // activation
  // ----------------------------------------------------------------------------------------------------------------
  async activate(indicator_id: number) {
    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET is_active = 1, update_date = :b
      WHERE id = :c
    
    `, [date, indicator_id]);

    return date;
  },

  async deactivate(indicator_id: number) {
    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET is_active = 0, update_date = :b
      WHERE id = :c
    
    `, [date, indicator_id]);

    return date;
  },




  // groups
  // ----------------------------------------------------------------------------------------------------------------
  async getGroups(indicator_id: number) {
    return (await oracle.exec(`
    
      SELECT *
      FROM indicator_group
      WHERE indicator_id = :a
    
    `, [indicator_id])).rows || [];
  },


  async assignGroup(indicator_id: number, group_id: number) {
    await oracle.exec(`
    
      INSERT INTO indicator_group (indicator_id, group_id)
      VALUES (:a, :b)

    `, [indicator_id, group_id])

    return true;
  },

  async removeGroup(indicator_id: number, group_id: number) {
    await oracle.exec(`
    
      DELETE FROM indicator_group
      WHERE indicator_id = :a, group_id = :b

    `, [indicator_id, group_id])

    return true;
  },
  
  
  
  
  // category
  // ----------------------------------------------------------------------------
  async addCategory(indicator_id: number, cat_id: number) {
    await oracle.exec(`
    
      INSERT INTO indicator_category (indicator_id, category_id)
      VALUES (:a, :b)
    
    `, [indicator_id, cat_id]);

    return true;
  },

  async removeCategory(indicator_id: number, cat_id: number) {
    await oracle.exec(`
    
      DELETE FROM indicator_category
      WHERE indicator_id = :a AND category_id = :b
    
    `, [indicator_id, cat_id]);

    return true;
  },




  // tags
  // ----------------------------------------------------------------------------
  async addTag(indicator_id: number, tag_value_id: number) {
    await oracle.exec(`
    
      INSERT INTO indicator_tag (indicator_id, tag_value_id)
      VALUES (:a, :b)
    
    `, [indicator_id, tag_value_id]);

    return true;
  },

  async removeTag(indicator_id: number, tag_id: number) {
    await oracle.exec(`
    
      DELETE FROM indicator_tag
      WHERE indicator_id = :a AND tag_id = :b
    
    `, [indicator_id, tag_id]);

    return true;
  }
}