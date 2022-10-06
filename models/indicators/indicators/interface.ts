import { Document } from "../..";

export interface Indicator {
  id: string;
  orgunit_id: string;
  topic_id: string;

  name_ar: string;
  name_en: string;

  desc_ar?: string;
  desc_en?: string;

  unit_ar?: string;
  unit_en?: string;

  is_active: 1 | 0;

  create_date: Date;
  update_date?: Date;
}

export interface IndicatorDetails extends Indicator {
  groups: number[];
  categories: number[];
}

export interface IndicatorDetailsQueryResultItem extends Indicator {
  group_id: number;
  category_id: number;
}

export interface IndicatorDocument extends Document {
  indicator_id: string;
}