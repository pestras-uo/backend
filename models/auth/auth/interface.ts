export interface Auth {
  USER_ID: string;
  
  PASSWORD: string;
  SALT: string;

  TOKEN?: string;
  SOCKET?: string;
  
  UPDATE_DATE?: Date;
}