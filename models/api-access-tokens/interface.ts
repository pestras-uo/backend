import { Document } from "../";

export interface ApiAccessToken {
  id: string;

  name_ar: string;
  name_en: string;
  desc_ar?: string;
  desc_en?: string;

  expiry_date?: Date;

  create_date: Date;
  update_date?: Date;
}

export interface ApiAccessTokenDoc extends Document {
  api_token_id: string;
}