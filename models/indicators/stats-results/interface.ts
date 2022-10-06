export interface DescStatsResult {
  config_id: string;

  group_column?: string;
  interval_date: Date;

  count: number;
  min: number;
  quartile_25: number;
  quartile_50: number;
  qaurtile_75: number;
  max: number;
  range: number;
  sum: number;
  mean: number;
  variance: number;
  std: number;
  mode: number;
  skew: number;
}