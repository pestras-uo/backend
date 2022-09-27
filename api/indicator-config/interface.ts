export interface CreateIndicatorConfig {
  indicator_id: string;

  intervals?: number;
  kpi_min?: number;
  kpi_max?: number;

  readings_view_name?: string;
  reading_date_column?: string;
  quantitative_columns?: string[];

  equation?: string;
  args: { id: string; variable: string; column: string }[];
}

export interface UpdateIndicatorIntervalBody {
  interval: number;
}

export interface UpdateIndicatorKPIsBody {
  min?: number;
  max?: number;
}

export interface UpdateIndicatorEquationBody {
  equation: string;
  args: { id: string; variable: string; column: string }[];
}

export interface UpdateIndicatorArgumentsBody {
  args: { id: string; variable: string; column: string }[];
}