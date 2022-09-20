export interface Auth {
  USER_ID: string;
  
  PASSWORD: string;
  SALT: string;

  TOKEN?: string;
  TOKEN_CREATE_DATE?: Date;
  TOKEN_EXP_DATE?: Date;
  SOCKET?: string;
  
  UPDATE_DATE?: Date;
}