export interface TagKey {
  ID: number;

  NAME_AR: string;
  NAME_EN: string;

  CREATE_DATE: Date; 
  UPDATE_DATE?: Date; 
}

export interface TagValue {
  ID: number;
  TAG_ID: number;

  NAME_AR: string;
  NAME_EN: string;
  
  CREATE_DATE: Date; 
  UPDATE_DATE?: Date; 
}

export interface Tag {
  KEY_ID: number;
  VALUE_ID: number;

  KEY_AR: string;
  KEY_EN: string;

  VALUE_AR: string;
  VALUE_EN: string;
}