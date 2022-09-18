import { getByRowId, getChildren } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { omit } from "../../../util/pick-omit";
import Serial from "../../../util/serial";
import { Group } from "../../auth/groups/interface";
import { Category } from "../../misc/categories/interface";
import { Tag } from "../../misc/tags/interface";
import { Indicator, IndicatorDetails, IndicatorDetailsQueryResultItem } from "./interface";

const TABLE_NAME = 'indicators';

async function clearArgs(id: string) {
  return oracle.exec(`
  
    DELETE FROM indicator_arguments
    WHERE indicator_id = :a
  
  `, [id]);
}

async function addArgs(id: string, args: { id: string, variable: string }[]) {
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

  async get(id: string) {
    const result = (await oracle.exec<IndicatorDetailsQueryResultItem>(`

      SELECT
        I.*,
        IG.GROUP_ID GROUP_ID,
        IC.CATEGORY_ID CATEGORY_ID
      FROM
        INDICATORS I,
        INDICATOR_GROUP IG,
        INDICATOR_CATEGORY IC
      WHERE
        I.ID = :a
        AND I.ID = IG.INDICATOR_ID
        AND I.ID = IC.INDICATOR_ID

    `, [id])).rows || [];

    if (result.length === 0)
      return null;

    const indicator = omit<IndicatorDetails, IndicatorDetailsQueryResultItem>(result[0], [
      'GROUP_ID',
      'CATEGORY_ID',
    ]);

    const groups = new Set<number>();
    const categories = new Set<number>();

    for (const rec of result) {
      groups.add(rec.GROUP_ID);
      categories.add(rec.CATEGORY_ID);
    }

    indicator.GROUPS = Array.from(groups);
    indicator.CATEGORIES = Array.from(categories);

    return indicator;
  },

  async getBySerial(serial: string) {
    return (await oracle.exec<Indicator>(`

      SELECT *
      FROM ${TABLE_NAME}
      WHERE serial = :serial

    `, [serial])).rows?.[0] || null;
  },

  async getByTopic(topic_id: string, active = 1) {
    return (await oracle.exec(`

      SELECT *
      FROM indicators
      WHERE topic_id = :a AND is_active = ${active}

    `, [topic_id])).rows || [];
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
  async create(ind: Indicator, parent?: string) {
    if (await this.nameExists(ind.NAME_AR, ind.NAME_EN))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const siblings = !!parent ? [] : await getChildren(TABLE_NAME, parent!);
    const id = Serial.gen(parent, siblings);

    const result = await oracle.exec(`

      INSERT INTO ${TABLE_NAME} (id, orgunit_id, topic_id, name_ar, name_en, desc_en, desc_ar, unit_ar, unit_en)
      VALUES (:a, :b, :c, :d, :e, :f, :g, :h, :i)

    `, [
      id,
      ind.ORGUNIT_ID,
      ind.TOPIC_ID,
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
  async update(id: string, ind: Indicator) {
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
  async setInterval(topic_id: string, interval: number) {
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
  async setKpi(topic_id: string, min?: number, max?: number) {
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
  async setEquation(id: string, eq: string, args: { id: string, variable: string }[]) {
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
  async updateOrganziation(indicator_id: string, orgunit_id: string) {
    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET orgunit_id = :a, update_date = :b
      WHERE id = :c
    
    `, [orgunit_id, date, indicator_id])

    return date;
  },




  // activation
  // ----------------------------------------------------------------------------------------------------------------
  async activate(indicator_id: string) {
    const date = new Date();

    await oracle.exec(`
    
      UPDATE ${TABLE_NAME}
      SET is_active = 1, update_date = :b
      WHERE id = :c
    
    `, [date, indicator_id]);

    return date;
  },

  async deactivate(indicator_id: string) {
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
  async getGroups(indicator_id: string) {
    return (await oracle.exec<Group>(`
    
      SELECT G.*
      FROM GROUPS G, INDICATOR_GROUP IG
      WHERE IG.INDICATOR_ID = :a AND G.ID = IG.GROUP_ID
    
    `, [indicator_id])).rows || [];
  },


  async assignGroup(indicator_id: string, group_id: string) {
    await oracle.exec(`
    
      INSERT INTO indicator_group (indicator_id, group_id)
      VALUES (:a, :b)

    `, [indicator_id, group_id])

    return true;
  },

  async removeGroup(indicator_id: string, group_id: string) {
    await oracle.exec(`
    
      DELETE FROM indicator_group
      WHERE indicator_id = :a, group_id = :b

    `, [indicator_id, group_id])

    return true;
  },




  // category
  // ----------------------------------------------------------------------------
  async getCategories(indicator_id: string) {
    return (await oracle.exec<Category>(`
    
      SELECT C.*
      FROM CATEGORIES C, INDICATOR_CATEGORY IC
      WHERE IC.INDICATOR_ID = :a AND C.ID = IC.CATEGORY_ID
    
    `, [indicator_id])).rows || [];
  },

  async addCategory(indicator_id: string, cat_id: string) {
    await oracle.exec(`
    
      INSERT INTO indicator_category (indicator_id, category_id)
      VALUES (:a, :b)
    
    `, [indicator_id, cat_id]);

    return true;
  },

  async removeCategory(indicator_id: string, cat_id: string) {
    await oracle.exec(`
    
      DELETE FROM indicator_category
      WHERE indicator_id = :a AND category_id = :b
    
    `, [indicator_id, cat_id]);

    return true;
  },




  // tags
  // ----------------------------------------------------------------------------
  async getTags(indicator_id: string) {
    return (await oracle.exec<Tag>(`
    
      SELECT
        K.ID as KEY_ID,
        V.ID as VALUE_ID,
        K.NAME_AR AS KEY_AR,
        K.NAME_EN AS KEY_EN,
        V.NAME_AR AS VALUE_AR,
        V.NAME_EN AS VALUE_EN
      FROM 
        TAGS_KEYS K,
        TAGS_VALUES V,
        INDICATOR_TAG IT
      WHERE
        IT.INDICATOR_ID = :a 
        AND V.ID = IT.TAG_VALUE_ID
        AND K.ID = V.TAG_KEY_ID
    
    `, [indicator_id])).rows || [];
  },

  async addTag(indicator_id: string, tag_value_id: string) {
    await oracle.exec(`
    
      INSERT INTO indicator_tag (indicator_id, tag_value_id)
      VALUES (:a, :b)
    
    `, [indicator_id, tag_value_id]);

    return true;
  },

  async removeTag(indicator_id: string, tag_id: string) {
    await oracle.exec(`
    
      DELETE FROM indicator_tag
      WHERE indicator_id = :a AND tag_id = :b
    
    `, [indicator_id, tag_id]);

    return true;
  },




  // documents
  // ----------------------------------------------------------------------------------------------------------------
  async getDocuments(indicator_id: string) {
    return (await oracle.exec<Document>(`
    
      SELECT D.*
      FROM DOCUMENTS D, INDICATOR_DOCUMENT ID
      WHERE ID.INDICATOR_ID = :a AND D.ID = ID.DOCUMENT_ID
    
    `, [indicator_id])).rows || [];
  },




  // Arguments
  // ----------------------------------------------------------------------------------------------------------------
  async getArguments(indicator_id: string) {
    return (await oracle.exec(`
    
      SELECT I.* IA.VARIABLE
      FROM
        INDICAOTRS I,
        INDICATOR_ARGUMENT IA
      WHERE
        IA.INDICATOR_ID = :a
        AND I.ID = IA.ARG_ID

    `, [indicator_id])).rows || [];
  }
}