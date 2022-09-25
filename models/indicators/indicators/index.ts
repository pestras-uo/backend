import { getChildren, TablesNames } from "../..";
import oracle from "../../../db/oracle";
import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { omit } from "../../../util/pick-omit";
import Serial from "../../../util/serial";
import { Group } from "../../auth/groups/interface";
import { Category } from "../../misc/categories/interface";
import { Indicator, IndicatorDetails, IndicatorDetailsQueryResultItem } from "./interface";

function clearArgs(id: string) {
  return oracle.op()
  .write(`
  
    DELETE FROM ${TablesNames.INDICATOR_ARGUMENT}
    WHERE indicator_id = :a
  
  `, [id])
  .commit();
}

function addArgs(id: string, args: { id: string, variable: string }[]) {
  return oracle.op()
    .writeMany(`
    
      INSERT INTO ${TablesNames.INDICATOR_ARGUMENT} (indicator_id, arg_id, variable)
      VALUES (:a, :b, :c)
    
    `, args.map(arg => [id, arg.id, arg.variable]))
    .commit();
}

export default {

  // Getters
  // ----------------------------------------------------------------------------
  async getPage(offset = 0, limit = 100, active = 1) {
    return (await oracle.op().read<Indicator>(`

      SELECT * 
      FROM ${TablesNames.INDICATORS}
      WHERE is_active = ${active}
      OFFSET :a ROWS
      FETCH NEXT :b ROWS ONLY

    `, [offset, limit])).rows || [];
  },

  async get(id: string) {
    const result = (await oracle.op().read<IndicatorDetailsQueryResultItem>(`

      SELECT
        I.*,
        IG.GROUP_ID GROUP_ID,
        IC.CATEGORY_ID CATEGORY_ID
      FROM
        ${TablesNames.INDICATORS} I,
        ${TablesNames.INDICATOR_GROUP} IG,
        ${TablesNames.INDICATOR_CATEGORY} IC
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
    return (await oracle.op().read<Indicator>(`

      SELECT *
      FROM ${TablesNames.INDICATORS}
      WHERE serial = :serial

    `, [serial])).rows?.[0] || null;
  },

  async getByTopic(topic_id: string, active = 1) {
    return (await oracle.op().read(`

      SELECT *
      FROM ${TablesNames.INDICATORS}
      WHERE topic_id = :a AND is_active = ${active}

    `, [topic_id])).rows || [];
  },




  // Util
  // ----------------------------------------------------------------------------
  async exists(id: string) {
    return (await oracle.op().read<{ count: number }>(`
 
       SELECT COUNT(id) as count
       FROM ${TablesNames.INDICATORS}
       WHERE id = :id
 
     `, [id])).rows?.[0].count! > 0;
  },

  async nameExists(name_ar: string, name_en: string) {
    return (await oracle.op().read<{ COUNT: number }>(`
 
       SELECT COUNT(name) as count
       FROM ${TablesNames.INDICATORS}
       WHERE name_ar = :name_ar OR name_en = :name_en
 
     `, [name_ar, name_en])).rows?.[0].COUNT! > 0;
  },

  async updatedNameExists(id: string, name_ar: string, name_en: string) {
    return (await oracle.op().read<{ count: number }>(`
 
       SELECT COUNT(name) as count
       FROM ${TablesNames.INDICATORS}
       WHERE (name_ar = :name_ar OR name_en = :name_en) AND id <> :id
 
     `, [name_ar, name_en, id])).rows?.[0].count! > 0;
  },




  // create
  // ----------------------------------------------------------------------------
  async create(ind: Indicator, parent?: string) {
    if (await this.nameExists(ind.NAME_AR, ind.NAME_EN))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const siblings = !!parent ? [] : await getChildren(TablesNames.INDICATORS, parent!);
    const id = Serial.gen(parent, siblings);

    await oracle.op()
      .write(`

        INSERT INTO ${TablesNames.INDICATORS} (id, orgunit_id, topic_id, name_ar, name_en, desc_en, desc_ar, unit_ar, unit_en)
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
      ])
      .commit();

    return this.get(id);
  },




  // update
  // ----------------------------------------------------------------------------
  async update(id: string, ind: Indicator) {
    if (await this.updatedNameExists(id, ind.NAME_AR, ind.NAME_EN))
      throw new HttpError(HttpCode.CONFLICT, "nameAlreadyExists");

    const date = new Date();

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.INDICATORS}
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
      ])
      .commit();

    return date;
  },




  // Interval
  // ----------------------------------------------------------------------------
  async setInterval(topic_id: string, interval: number) {
    const date = new Date();

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.INDICATORS}
        SET interval = :a, update_date = :b
        WHERE id = :c
      
      `, [interval, date, topic_id])
      .commit();

    return date;
  },




  // Kpi
  // ----------------------------------------------------------------------------
  async setKpi(topic_id: string, min?: number, max?: number) {
    const date = new Date();

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.INDICATORS}
        SET kpi_min = :a, kpi_max = :b, update_date = :c
        WHERE id = :d
      
      `, [min || null, max || null, date, topic_id])
      .commit();

    return date;
  },




  // equation
  // ----------------------------------------------------------------------------
  async setEquation(id: string, eq: string, args: { id: string, variable: string }[]) {
    await clearArgs(id);
    if (args.length > 0)
      await addArgs(id, args);

    const date = new Date();

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.INDICATORS}
        SET equation = :a, date = :b
        WHERE id = :c
      
      `, [eq, date, id])
      .commit();

    return date;
  },




  // orgunit
  // ----------------------------------------------------------------------------------------------------------------
  async updateOrgunit(indicator_id: string, orgunit_id: string) {
    const date = new Date();

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.INDICATORS}
        SET orgunit_id = :a, update_date = :b
        WHERE id = :c
      
      `, [orgunit_id, date, indicator_id])
      .commit();

    return date;
  },




  // activation
  // ----------------------------------------------------------------------------------------------------------------
  async activate(indicator_id: string, state = 1) {
    const date = new Date();

    await oracle.op()
      .write(`
      
        UPDATE ${TablesNames.INDICATORS}
        SET is_active = :a, update_date = :b
        WHERE id = :c
      
      `, [state, date, indicator_id])
      .commit();

    return date;
  },




  // groups
  // ----------------------------------------------------------------------------------------------------------------
  async getGroups(indicator_id: string) {
    return (await oracle.op().read<Group>(`
    
      SELECT G.*
      FROM ${TablesNames.GROUPS} G, ${TablesNames.INDICATOR_GROUP} IG
      WHERE IG.INDICATOR_ID = :a AND G.ID = IG.GROUP_ID
    
    `, [indicator_id])).rows || [];
  },

  async replaceGroups(indicator_id: string, groups: string[]) {
    await oracle.op()
      .write(`
      
        DELETE FROM ${TablesNames.INDICATOR_GROUP}
        WHERE indicator_id = :a

      `, [indicator_id])
      .writeMany(`
      
        INSERT INTO ${TablesNames.INDICATOR_GROUP} (indicator_id, group_id)
        VALUES (:a, :b)
      
      `, groups.map(g => [indicator_id, g]))
      .commit();

    return true;
  },




  // category
  // ----------------------------------------------------------------------------
  async getCategories(indicator_id: string) {
    return (await oracle.op().read<Category>(`
    
      SELECT C.*
      FROM ${TablesNames.CATEGORIES} C, ${TablesNames.INDICATOR_CATEGORY} IC
      WHERE IC.INDICATOR_ID = :a AND C.ID = IC.CATEGORY_ID
    
    `, [indicator_id])).rows || [];
  },

  async replaceCategories(indicator_id: string, categories: string[]) {
    await oracle.op()
      .write(`
      
        DELETE FROM ${TablesNames.INDICATOR_CATEGORY}
        WHERE indicator_id = :a
      
      `, [indicator_id])
      .writeMany(`
      
        INSERT INTO ${TablesNames.INDICATOR_CATEGORY} (indicator_id, category_id)
        VALUES (:a, :b)
      
      `, categories.map(c => [indicator_id, c]))
      .commit();

    return true;
  },




  // tags
  // ----------------------------------------------------------------------------
  async getTags(indicator_id: string) {
    // TODO
    return null;
  },

  async replaceTags(indicator_id: string, tags: string[]) {
      await oracle.op().write(`
      
        DELETE FROM ${TablesNames.INDICATOR_TAG}
        WHERE indicator_id = :a
      
      `, [indicator_id])
      .writeMany(`
      
        INSERT INTO ${TablesNames.INDICATOR_TAG} (indicator_id, tag_value_id)
        VALUES (:a, :b)
      
      `, tags.map(t => [indicator_id, t]))
      .commit();

    return true;
  },




  // documents
  // ----------------------------------------------------------------------------------------------------------------
  async getDocuments(indicator_id: string) {
    return (await oracle.op().read<Document>(`
    
      SELECT D.*
      FROM ${TablesNames.DOCUMENTS} D, ${TablesNames.INDICATOR_DOCUMENT} ID
      WHERE ID.INDICATOR_ID = :a AND D.ID = ID.DOCUMENT_ID
    
    `, [indicator_id])).rows || [];
  },




  // Arguments
  // ----------------------------------------------------------------------------------------------------------------
  async getArguments(indicator_id: string) {
    return (await oracle.op().read(`
    
      SELECT I.* IA.VARIABLE
      FROM
        ${TablesNames.INDICATORS} I,
        ${TablesNames.INDICATOR_ARGUMENT} IA
      WHERE
        IA.INDICATOR_ID = :a
        AND I.ID = IA.ARG_ID

    `, [indicator_id])).rows || [];
  }
}