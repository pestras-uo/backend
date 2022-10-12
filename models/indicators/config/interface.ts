export enum IndicatorType {
  MANUAL,
  COMPUTATIONAL,
  EXTERNAL,
  PARTITION
}

export enum IndicatorInterval {
  NONE = 0,
  MONTHLY = 1,
  QUARTERLY = 3,
  BIANNUAL = 6,
  ANNUAL = 12
}

export enum ColumnType {
  ID,
  REF,
  NUMBER,
  TEXT,
  CATEGORY,
  DATE,
  JSON,
  BOOL
}

export enum IndicatorState {
  IDLE,
  COMPUTING,
  ANALYZING,
  REVIEW
}

export type FilterOperator = '=' | '>' | '<' | '>=' | '<=' | '<>' | 'LIKE' | 'IS';

export type FilterOption = [string, FilterOperator, number | string];

export interface FilterOptions {
  and?: (FilterOption | FilterOptions)[];
  or?: (FilterOption | FilterOptions)[];
}

export interface ComputeOptions {
  equation: string;
  join_on: [string, string][];
  arguments: {
    id: string;
    variable: string;
    clone_columns: string[];
    filter_opitons: FilterOptions;
  }[];
}

export interface ReadingColumn {
  name: string;
  type: ColumnType;
  
  is_reading_value?: boolean;
  is_reading_date?: boolean;
  is_system?: boolean;
  
  category_id?: string;

  name_ar: string;
  name_en: string;
}

export interface BasicIndConf {
  indicator_id: string;

  source_name: string;
  type: IndicatorType;

  intervals?: IndicatorInterval;
  evaluation_day?: number;

  kpi_min?: number;
  kpi_max?: number;
  
  state?: IndicatorState;
}

export interface DBIndConf extends BasicIndConf{
  compute_options?: string;
  filter_options?: string;
  columns?: string;
}

export interface IndConf extends BasicIndConf {
  compute_options?: ComputeOptions; 
  filter_options?: FilterOptions;
  columns?: ReadingColumn[];
}