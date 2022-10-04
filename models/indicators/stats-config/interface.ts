export interface StatsConfig {
  id: string;
  indicator_id: string;

  group_by_intervals: 0 | 1;
  group_by_column?: string;
}