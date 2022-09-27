import { Validall } from "@pestras/validall";

export enum IndicatorConfigValidators {
  CREATE = 'createIndicatorConfig',
  UPDATE_INTERVALS = 'updateIndicatorInterval',
  UPDATE_KPIS = 'updateIndicatorKPIs',
  UPDATE_EQUATION = 'updateIndicatorEquation'
}

const INDICATOR_ARGS_SCHEMA = 'indicatorArgumentsSchema';

new Validall(INDICATOR_ARGS_SCHEMA, {
  $default: [],
  $each: {
    $props: {
      id: { $type: 'string', $required: true, $message: 'argumentIdIsRequired' },
      varaibe: { $type: 'string', $required: true, $message: 'argumentVariableIsRequired' },
      column: { $type: 'string', $required: true, $message: 'argumentColumnNameIsRequired' },
    }
  }
});

new Validall(IndicatorConfigValidators.CREATE, {
  indicator_id: { $type: 'string', $required: true, $message: 'indicatorIdIsRequired' },
  intervals: { $type: 'number', $enum: [1, 3, 6, 12], $default: 12, $message: 'invalidIndicatorInterval' },
  kpi_min: { $type: 'number', $nullable: true, $message: 'invalidKpiMin' },
  kpi_max: { $type: 'number', $nullable: true, $message: 'invalidKpiMax' },
  readings_view_name: { $type: 'string', $default: '', $message: 'invalidReadingsViewName' },
  reading_date_column: { $type: 'string', $default: 'reading_date', $message: 'invalidReadingDateColumnName' },
  quantitative_columns: { $default: [], $each: { $type: 'string', $message: 'invalidQuantitativeColumnName' } },
  equation: { $type: 'string', $default: '', $message: 'invalidEquation' },
  args: { $ref: INDICATOR_ARGS_SCHEMA }
});

new Validall(IndicatorConfigValidators.UPDATE_INTERVALS, {
  intervals: { $type: 'number', $enum: [1, 3, 6, 12], $default: 12, $message: 'invalidIndicatorInterval' }
});

new Validall(IndicatorConfigValidators.UPDATE_KPIS, {
  kpi_min: { $type: 'number', $nullable: true, $message: 'invalidKpiMin' },
  kpi_max: { $type: 'number', $nullable: true, $message: 'invalidKpiMax' }
});

new Validall(IndicatorConfigValidators.UPDATE_EQUATION, {
  equation: { $type: 'string', $default: '', $message: 'invalidEquation' },
  args: { $ref: INDICATOR_ARGS_SCHEMA }
});