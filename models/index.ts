import oracle from "../db/oracle";
import Serial from '../util/serial';

export enum TablesNames {
  AUTH = "auth",
  GROUPS = "groups",
  ROLES = "roles",
  USERS = "users",
  
  CATEGORIES = "categories",

  ORGUNITS = "orgunits",
  TOPICS = "topics",
  TOPIC_CAT = "topic_category",
  TOPIC_DOC = "topic_document",

  INDICATORS = "indicators",
  IND_CAT = "indicator_category",
  IND_DOC = "indicator_document",
  
  IND_CONF = "indicator_config",
  IND_ARG = "indicator_argument",
  READ_ADD_COLS = "reading_additional_columns",
  
  STATS_CONF = "stats_config",
  DESC_STATS_RESULT = "descriptive_stats_result",
  
  WEB_SERVICE_CONFIG = 'indicator_web_service_config',
  
  READ_DOC = "reading_document"
}

export interface Document {  
  path: string;

  name_ar: string;
  name_en: string;

  upload_date: Date;
}

export async function getChildren(table: string, serial: string) {
  const result = await oracle.op().query<{ id: string }>(`

    SELECT id 'id'
    FROM ${table}
    WHERE id LIKE :a

  `, [`${serial}%`]);

  if (!result.rows)
    return [];

  return result
    .rows
    .filter(row => row.id === serial)
    .map(row => Serial.getLast(row.id));
}

export async function exists(tableName: TablesNames, id: string) {
  return (await oracle.op().query<{ count: number }>(`
    
      SELECT COUNT(*) "count"
      FROM ${tableName}
      WHERE ID = :a
    
    `, [id])).rows?.[0].count! > 0;
}