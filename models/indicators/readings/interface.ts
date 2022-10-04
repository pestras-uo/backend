import { Document } from "../..";

export interface IndicatorReading {
  id: string;

  reading_value: number;

  note_ar?: string;
  note_en?: string;

  is_approved?: 1 | 0;
  approve_date?: Date;

  history: string;
  
  create_date: Date;
  update_date?: Date;
}

export interface ReadingHistoryItem {
  reading_value: number

  note_ar: string;
  note_en: string;
  
  update_date: string;

  [key: string]: any;
}

export interface ReadingDocument extends Document {
  indicator_id: string;
  reading_id: string;
}