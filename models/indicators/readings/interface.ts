import { Document } from "../..";

export interface IndicatorReading {
  ID: string;

  VALUE: number;

  NOTE_AR?: string;
  NOTE_EN?: string;

  IS_APPROVED?: 1 | 0;
  APPROVE_DATE?: Date;

  HISTORY: string;

  READING_DATE: Date;
  CREATE_DATE: Date;
  UPDATE_DATE?: Date;
}

export interface ReadingHistoryItem {
  VALUE: number

  NOTE_AR: string;
  NOTE_EN: string;

  READING_DATE: string;
  UPDATE_DATE: string;
}

export interface ReadingDocument extends Document {
  INDICATOR_ID: string;
  READING_ID: string;
}