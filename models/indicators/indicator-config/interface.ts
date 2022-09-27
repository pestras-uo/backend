export interface IndicatorConfig {
  INDICATOR_ID: string;

  INTERVALS?: 1 | 3 | 6 | 12;

  KPI_MIN?: number;
  KPI_MAX?: number;

  READINGS_VIEW_NAME?: string;
  READING_DATE_COLUMN?: string;
  QANTITATIVE_COLUMNS: string;

  EQUATION?: string;
}