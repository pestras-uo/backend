import oracle from "../db/oracle";
import Serial from '../util/serial';

export enum TablesNames {
  AUTH = "auth",
  GROUPS = "groups",
  ROLES = "roles",
  USERS = "users",
  USER_GROUP = "user_group",
  USER_ROLE = "user_role",

  DOCUMENTS = "documents",
  CATEGORIES = "categories",
  TAGS_KEYS = "tags_keys",
  TAGS_VALUES = "tags_values",

  ORGUNITS = "orgunits",
  TOPICS = "topics",
  TOPIC_TAG = "topic_tag",
  TOPIC_CATEGORY = "topic_category",
  TOPIC_DOCUMENT = "topic_document",
  TOPIC_GROUP = "topic_group",

  INDICATORS = "indicators",
  INDICATOR_TAG = "indicator_tag",
  INDICATOR_CATEGORY = "indicator_category",
  INDICATOR_DOCUMENT = "indicator_document",
  INDICATOR_GROUP = "indicator_group",
  INDICATOR_ARGUMENT = "indicator_argument",

  INDICATOR_CONFIG = "indicator_config",

  STATS_CONFIG = "stats_config",
  DESCRIPTIVE_STATS_RESULT = "descriptive_stats_result",

  DISTRICTS = "districts",
  READING_DOCUMENT = "reading_document"
}

export async function getChildren(table: string, serial: string) {
  const result = await oracle.op().read<{ ID: string }>(`

    SELECT id
    FROM ${table}
    WHERE id LIKE '${serial}%'

  `);

  if (!result.rows)
    return [];

  return result
    .rows
    .filter(row => row.ID === serial)
    .map(row => Serial.last(row.ID));
}

export async function exists(tableName: TablesNames, id: string) {
  return (await oracle.op().read<{ COUNT: number }>(`
    
      SELECT COUNT(*)
      FROM ${tableName}
      WHERE ID = :a
    
    `, [id])).rows?.[0].COUNT! > 0;
}