export interface TagKey {
  ID: string;

  NAME_AR: string;
  NAME_EN: string;
}

export interface TagValue {
  ID: string;
  KEY_ID: string;

  NAME_AR: string;
  NAME_EN: string;
}

export interface TagQueryResult {
  ID: string;
  VALUE_ID: string;

  KEY_AR: string;
  KEY_EN: string;

  VALUE_AR: string;
  VALUE_EN: string;
}

export interface TagMap extends TagKey {
  VALUES: Map<string, TagKey>;
}

export interface Tag extends TagKey {
  VALUES: TagKey[];
}

