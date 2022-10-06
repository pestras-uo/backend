export interface StatsConfig {
  id: string;
  indicator_id: string;

  name_ar: string;
  name_en: string;

  group_by_intervals: 0 | 1;
  group_by_column?: string;
}