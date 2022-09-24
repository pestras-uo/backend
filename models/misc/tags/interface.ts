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

export interface Tag {
  ID: string;

  NAME_AR: string;
  NAME_EN: string;

  VALUES: {
    ID: string;

    NAME_AR: string;
    NAME_EN: string;
  }[]
}

