export interface IndicatorConfig {
  INDICATOR_ID: string;

  INTERVALS?: 1 | 3 | 6 | 12;

  KPI_MIN?: number;
  KPI_MAX?: number;

  READINGS_VIEW?: string;
  VALUES_COLUMNS?: string;

  EQUATION?: string;

  EVALUATION_DAY?: number;
  STATE: 0 | 1;
}

export interface IndicatorArgument {
  INDICATOR_ID: string;
  ARGUMENT_ID: string;
  COLUMN: string;
  VARIABLE: string;
}