import { Validall } from "@pestras/validall";

export enum IndicatorConfigValidators {
  CREATE = 'createIndicatorConfig',
  UPDATE_INTERVALS = 'updateIndicatorInterval',
  UPDATE_KPIS = 'updateIndicatorKPIs',
  UPDATE_EQUATION = 'updateIndicatorEquation',
  UPDATE_EVAL_DAY = 'updateIndicatorEvaluationDay',
  UPDATE_READINGS_VIEW = 'updateIndicatorReadingsView'
}

const INDICATOR_ARGS_SCHEMA = 'indicatorArgumentsSchema';

new Validall(INDICATOR_ARGS_SCHEMA, {
  $default: [],
  $each: {
    $props: {
      id: { $type: 'string', $required: true, $message: 'argumentIdIsRequired' },
      varaibe: { $type: 'string', $required: true, $message: 'argumentVariableIsRequired' }
    }
  }
});

new Validall(IndicatorConfigValidators.CREATE, {
  indicator_id: { $type: 'string', $required: true, $message: 'indicatorIdIsRequired' },
  intervals: { $type: 'number', $enum: [1, 3, 6, 12], $default: 12, $message: 'invalidIndicatorInterval' },
  kpi_min: { $type: 'number', $nullable: true, $message: 'invalidKpiMin' },
  kpi_max: { $type: 'number', $nullable: true, $message: 'invalidKpiMax' },
  readings_view: { $type: 'string', $nullable: true, $message: 'invalidReadingsViewName', $name: [{ $required: true, $as: 'isView' }] },
  values_columns: {
    $cond: [{ $if: 'isView', $then: { $is: 'notEmpty', $required: true, $message: 'valuesColumnsAreRequired' } }, { $else: { $default: [] } }],
    $each: { $type: 'string', $message: 'invalidValueColumnName' }
  },
  equation: { $type: 'string', $default: '', $message: 'invalidEquation' },
  evaluation_day: { $type: 'number', $inRange: [0, 28], $default: 1, $message: 'invalidEvaluationDay' },
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

new Validall(IndicatorConfigValidators.UPDATE_EVAL_DAY, {
  day: { $type: 'number', $inRange: [0, 28], $default: 1, $message: 'invalidEvaluationDay' }
});

new Validall(IndicatorConfigValidators.UPDATE_EVAL_DAY, {
  readings_view: { $type: 'string', $nullable: true, $message: 'invalidReadingsViewName', $name: [{ $required: true, $as: 'isView' }]  },
  values_columns: {
    $cond: [{ $if: 'isView', $then: { $is: 'notEmpty', $required: true, $message: 'valuesColumnsAreRequired' } }, { $else: { $default: [] } }],
    $each: { $type: 'string', $message: 'invalidValueColumnName' }
  }
});