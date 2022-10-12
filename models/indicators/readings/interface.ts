import { Document } from "../..";

export interface ManualIndicatorReading {
  id: string;

  is_approved?: 1 | 0;
  approve_date?: Date;

  history: string;
  
  create_date: Date;
  create_by: Date;
  update_date?: Date;
  update_by: string;

  [key: string]: number | string | Date;
}

export interface ComputationalIndicatorReading {
  id: string;
  
  create_date: Date;

  [key: string]: number | string | Date;
}

export interface ExternalIndicatorReading {
  [key: string]: number | string | Date;
}

export interface ReadingHistoryItem {  
  update_date: string;
  update_by: string;

  [key: string]: number | string | Date;
}

export interface ReadingDocument extends Document {
  indicator_id: string;
  reading_id: string;
}