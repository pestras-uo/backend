import { Document } from "../..";

export interface Topic {
  ID: string;

  NAME_AR: string;
  NAME_EN: string;

  DESC_AR?: string;
  DESC_EN?: string;

  CREATE_DATE: Date;
  UPDATE_DATE?: Date;
}

export interface TopicDetails extends Topic {
  GROUPS: number[];
  CATEGORIES: number[];
}

export interface TopicDetailsQueryResultItem extends Topic {
  GROUP_ID: number;
  CATEGORY_ID: number;
}

export interface TopicDocument extends Document {
  TOPIC_ID: string;
}