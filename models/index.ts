import oracle from "../db/oracle";
import Serial from '../util/serial';

export enum SchemaNames {
  SYSTEM = "",
  READINGS = ""
}

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

  DISTRICTS = "districts",
  READING_DOCUMENT = "reading_document"
}

export async function getByRowId<T>(table: string, rowid: string) {
  return (await oracle.exec<T>(`
  
    SELECT *
    FROM ${table}
    WHERE rowid = :a
  
  `, [rowid])).rows?.[0];
}

export async function getChildren(table: string, serial: string) {
  const result = await oracle.exec<{ ID: string }>(`

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