export interface IndicatorReading {
  ID: string;
  DISTRICT_ID: string;

  INDICATOR_ID: string;

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
  CHANGE: {
    COLUMN_NAME: string,
    VALUE: string
  }[];

  NOTE_AR: string;
  NOTE_EN: string;

  READING_DATE: string;
  UPDATE_DATE: string;
}