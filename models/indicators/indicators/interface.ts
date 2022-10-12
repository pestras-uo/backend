import { Document } from "../..";

interface BasicIndicator {
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
  create_by: string;
  update_date?: Date;
  update_by: string;
}

export interface DBIndicator extends BasicIndicator {
  categories: string;
}

export interface Indicator extends BasicIndicator {
  categories: string[];
}

export interface IndicatorDocument extends Document {
  indicator_id: string;
}