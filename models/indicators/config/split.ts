import { HttpError } from "../../../misc/errors";
import { HttpCode } from "../../../misc/http-codes";
import { ColumnType, IndConf, IndicatorType, ReadingColumn } from "./interface";
import { get } from "./read";
import catModel from '../../core/categories';
import indModel from '../indicators';
import { Indicator } from "../indicators/interface";
import serial from "../../../util/serial";
import oracle from "../../../db/oracle";
import { TablesNames } from "../..";

export async function splitIndicator(indicator_id: string, categorial_column: string, issuer: string) {
  const indicator = await indModel.get(indicator_id);
  const config = await get(indicator_id);
  const column = config.columns.find(c => c.name === categorial_column);

  if (!column)
    throw new HttpError(HttpCode.NOT_FOUND, "columnNotFound");

  if (column.type !== ColumnType.CATEGORY)
    throw new HttpError(HttpCode.BAD_REQUEST, 'splitColumnMustBeCategorial');

  if (!column.category_id)
    return splitIndicatorManually(indicator, config, column, issuer);

  const categories = await catModel.getCategoryChildren(column.category_id);

  if (categories.length <= 1)
    throw new HttpError(HttpCode.FORBIDDEN, 'sufficiantCategoriesCount');

  const indicators: Indicator[] = [];
  const configs: IndConf[] = [];
  const ids: string[] = [];

  for (const cat of categories) {
    const id = serial.gen(indicator.id, ids);

    indicators.push({
      ...indicator,
      id,
      name_ar: `${indicator.name_ar} - ${column.name_ar}: ${cat.name_ar}`,
      name_en: `${indicator.name_en} - ${column.name_en}: ${cat.name_en}`,
    });

    ids.push(id);

    configs.push({
      indicator_id: id,
      source_name: config.source_name,
      type: IndicatorType.PARTITION,
      intervals: config.intervals,
      kpi_min: config.kpi_min,
      kpi_max: config.kpi_max,
      filter_options: { and: [[`$${column.name}`, '=', cat.id]] }
    });
  }

  await addPartitions(indicators, configs, issuer);

  return ids;
}




// split manually
// --------------------------------------------------------------------------------
async function splitIndicatorManually(indicator: Indicator, config: IndConf, column: ReadingColumn, issuer: string) {
  const categories = ((await oracle.op().query<{ category: string}>(`
  
    SELECT DISTINCT(${column.name}) "category"
    FROM ${config.source_name}
  
  `)).rows || []).map(c => c.category);

  if (categories.length <= 1)
    throw new HttpError(HttpCode.FORBIDDEN, 'sufficiantCategoriesCount');

  const indicators: Indicator[] = [];
  const configs: IndConf[] = [];
  const ids: string[] = [];

  for (const cat of categories) {
    const id = serial.gen(indicator.id, ids);

    indicators.push({
      ...indicator,
      id,
      name_ar: `${indicator.name_ar} - ${column.name_ar}: ${cat}`,
      name_en: `${indicator.name_en} - ${column.name_en}: ${cat}`,
    });

    ids.push(id);

    configs.push({
      indicator_id: id,
      source_name: config.source_name,
      type: IndicatorType.PARTITION,
      intervals: config.intervals,
      kpi_min: config.kpi_min,
      kpi_max: config.kpi_max,
      filter_options: { and: [[`$${column.name}`, '=', cat]] }
    });
  }

  await addPartitions(indicators, configs, issuer);

  return ids;
}




// add partition to database
// --------------------------------------------------------------------------------
async function addPartitions(indicators: Indicator[], configs: IndConf[], issuer: string) {
  await oracle.op()
    .writeMany(`

      INSERT INTO ${TablesNames.INDICATORS} (
        id, orgunit_id, topic_id,
        name_ar, name_en,
        desc_ar, desc_en, unit_ar, unit_en,
        create_by
      ) VALUES (
        :a, :b, :c,
        :d, :e,
        :f, :g, :h, :i,
        :j
      )
    
    `, indicators.map(i => [
      i.id, i.orgunit_id, i.topic_id,
      i.name_ar, i.name_en,
      i.desc_ar, i.desc_en, i.unit_ar, i.unit_en,
      issuer
    ]))
    .writeMany(`
    
      INSERT INTO ${TablesNames.IND_CONF} (
        indicator_id,
        source_name, type,
        intervals,
        kpi_min, kpi_max,
        filter_options
      ) VALUES (
        :a,
        :b, :c,
        :d,
        :e, :f,
        :g
      )
    
    `, configs.map(c => [
      c.indicator_id,
      c.source_name, c.type,
      c.intervals,
      c.kpi_min, c.kpi_max,
      c.filter_options
    ]))
    .commit();
}