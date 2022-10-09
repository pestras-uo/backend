import { Document } from "../..";

interface BasicTopic {
  id: string;

  name_ar: string;
  name_en: string;

  desc_ar?: string;
  desc_en?: string;

  create_date: Date;
  create_by: string;
  update_date?: Date;
  update_by?: string;
}

export interface DBTopic extends BasicTopic {
  categories: string;
}

export interface Topic extends BasicTopic {
  categories: string[];
}

export interface TopicDocument extends Document {
  topic_id: string;
}