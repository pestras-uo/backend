export interface Auth {
  USER_ID: string;
  
  PASSWORD: string;
  SALT: string;

  TOKEN?: string;
  SOCKET?: string;
  
  CREATE_DATE: Date;
  UPDATE_DATE?: Date;
}