export interface IndicatorWebServiceConfig {
  INDICATOR_ID: string;

  RESOURCE_URI: string;
  USERNAME?: string;
  PASSWORD?: string;
  ACCESS_TOKEN?: string;
  QUERY?: string;

  VALUES_COLUMNS: string;
  READING_DATE_COLUMN: string;
  CATEGORIAL_COLUMNS: string;
}