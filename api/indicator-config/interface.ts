export interface CreateIndicatorConfigBody {
  indicator_id: string;

  intervals?: 1 | 3 | 6 | 12;
  kpi_min?: number;
  kpi_max?: number;

  readings_view_name?: string;
  reading_date_column?: string;
  quantitative_columns?: string[];

  equation?: string;
  args: { id: string; variable: string; column: string }[];
}

export interface UpdateIndicatorIntervalBody {
  intervals: number;
}

export interface UpdateIndicatorKPIsBody {
  min?: number;
  max?: number;
}

export interface UpdateIndicatorEquationBody {
  equation: string;
  args: { id: string; variable: string; column: string }[];
}