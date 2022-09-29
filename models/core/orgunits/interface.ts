export interface Orgunit {
  ID: string;

  NAME_AR: string; 
  NAME_EN: string;

  IS_MASTER: number;
  
  CREATE_DATE: Date;
  UPDATE_DATE?: Date;
}