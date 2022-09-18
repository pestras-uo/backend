export interface Document {
  ID: string;

  NAME_EN?: string; 
  NAME_AR?: string;
  DESC_AR?: string;
  DESC_EN?: string;

  PATH: string, 
  MIME_TYPE: string
  
  CREATE_DATE: Date;
}