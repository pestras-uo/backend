export interface DescriptiveStatsResult {
  INDICATOR_NAME: string;
  COLUMN_NAME: string;

  GROUP_COLUMN: string;
  INTERVAL_DATE: Date;

  COUNT: number;
  MIN: number;
  QUARTILE_25: number;
  QUARTILE_50: number;
  QUARTILE_75: number;
  MAX: number;
  RANGE: number;
  SUM: number;
  MEAN: number;
  VARIANCE: number;
  STD: number;
  MODE: number;
  SKEW: number;
}