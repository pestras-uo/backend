import { Document } from "../..";

export interface Topic {
  id: string;

  name_ar: string;
  name_en: string;

  desc_ar?: string;
  desc_en?: string;

  create_date: Date;
  update_date?: Date;
}

export interface TopicDetails extends Topic {
  groups: number[];
  categories: number[];
}

export interface TopicDetailsQueryResultItem extends Topic {
  group_id: number;
  category_id: number;
}

export interface TopicDocument extends Document {
  topic_id: string;
}