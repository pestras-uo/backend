export interface Auth {
  ID: number;
  USER_ID: number;
  
  PASSWORD: string;
  SALT: string;

  TOKEN?: string;
  SOCKET?: string;
  
  CREATE_DATE: Date;
  UPDATE_DATE?: Date;
}