export interface IndicatorEqConfig {
  INDICATOR_ID: string;
  EQUATION: string;
  CLONE_CATEGORIES: 0 | 1;
}

export interface IndicatorArgument {
  INDICATOR_ID: string;
  ARGUMENT_ID: string;
  VARIABLE: string;
  VALUE_COLUMN?: string;
}