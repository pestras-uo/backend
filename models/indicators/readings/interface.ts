export interface IndicatorReading {
  ID: number;
  DISTRICT_ID: number;

  INDICATOR_ID: string;

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
  VALUE: number;

  NOTE_AR: string;
  NOTE_EN: string;

  READING_DATE: string;
  UPDATE_DATE: string;
}