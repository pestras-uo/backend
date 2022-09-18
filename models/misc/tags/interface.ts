export interface TagKey {
  ID: string;

  NAME_AR: string;
  NAME_EN: string; 
}

export interface TagValue {
  ID: string;
  TAG_ID: string;

  NAME_AR: string;
  NAME_EN: string;
}

export interface Tag {
  KEY_ID: string;
  VALUE_ID: string;

  KEY_AR: string;
  KEY_EN: string;

  VALUE_AR: string;
  VALUE_EN: string;
}