export interface Auth {
  user_id: string;
  
  password: string;
  salt: string;

  token?: string;
  token_create_date?: Date;
  token_exp_date?: Date;
  socket?: string;
  
  update_date?: Date;
}