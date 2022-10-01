export enum IndicatorType {
  MANUAL,
  VIEW,
  WEB_SERVICE,
  EQUATION
}

export enum IndicatorInterval {
  MONTHLY = 1,
  QUARTERLY = 3,
  BIANNUAL = 6,
  ANNUAL = 12
}

export interface IndicatorConfig {
  INDICATOR_ID: string;

  TYPE: IndicatorType;  
  
  INTERVALS?: IndicatorInterval;
  EVALUATION_DAY?: number;
  STATE?: 0 | 1;

  KPI_MIN?: number;
  KPI_MAX?: number;  
}

export interface IndicatorArgument {
  INDICATOR_ID: string;
  ARGUMENT_ID: string;
  VALUE_COLUMN: string;
  VARIABLE: string;
}