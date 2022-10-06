export enum IndicatorInterval {
  NONE = 0,
  MONTHLY = 1,
  QUARTERLY = 3,
  BIANNUAL = 6,
  ANNUAL = 12
}

export enum ColumnType {
  NUMBER,
  TEXT,
  DATE
}

export enum IndicatorState {
  IDLE,
  COMPUTING,
  ANALYZING
}

export interface IndicatorConfig {
  indicator_id: string;

  reading_value_name_ar: string;
  reading_value_name_en: string;

  intervals?: IndicatorInterval;
  evaluation_day?: number;
  require_approval?: 0 | 1;

  kpi_min?: number;
  kpi_max?: number;

  view_name?: string;
  equation?: string;
  match_by_columns?: string;
  
  state?: IndicatorState;
}

export interface IndicatorArgument {
  indicator_id: string;
  argument_id: string;
  variable: string;
}

export interface ReadingColumn {
  id: string;
  indicator_id: string;

  column_name: string;
  type: ColumnType;

  name_ar: string;
  name_en: string;
}