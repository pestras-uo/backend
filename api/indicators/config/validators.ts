import { Validall } from "@pestras/validall";
import { ColumnType, IndicatorInterval } from "../../../models/indicators/config/interface";

export enum IndicatorConfigValidators {
  CREATE_MANUAL = 'createManualIndicatorConfig',
  CREATE_COMPUTATIONAL = 'createComputaionalIndicatorConfig',
  CREATE_VIEW = 'createViewIndicatorConfig',
  UPDATE = 'updateIndicatorConfig'
}

const INVT = IndicatorInterval;

const CREATE_BASE = 'createBaseConfigSchema';

new Validall(CREATE_BASE, {
  reading_value_name_ar: { $type: 'string', $required: true, $message: 'readingValueNameArIsRequired' },
  reading_value_name_en: { $type: 'string', $required: true, $message: 'readingValueNameEnIsRequired' },
  intervals: {
    $type: 'number',
    $enum: [INVT.MONTHLY, INVT.QUARTERLY, INVT.BIANNUAL, INVT.ANNUAL],
    $default: INVT.ANNUAL,
    $message: 'invalidIndicatorInterval'
  },
  evaluation_day: { $type: 'number', $inRange: [1, 28], $default: 1, $message: 'invalidEvaluationDay' },
  kpi_min: { $type: 'number', $nullable: true, $message: 'invalidKpiMin' },
  kpi_max: { $type: 'number', $nullable: true, $message: 'invalidKpiMax' }
});

const ADDITIONAL_COLUMN = 'additionalColumnSchema';

new Validall(ADDITIONAL_COLUMN, {
  column_name: { $type: 'string', $required: true, $message: 'columnNameIsRequired' },
  type: { $type: 'number', $enum: [ColumnType.NUMBER, ColumnType.TEXT, ColumnType.DATE], $default: ColumnType.TEXT },
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' }
});

new Validall(IndicatorConfigValidators.CREATE_MANUAL, {
  $ref: CREATE_BASE,
  $props: {
    require_approval: { $type: 'number', $enum: [0,1], $default: 0 },
    additional_columns: { $default: [], $each: { $ref: ADDITIONAL_COLUMN } }
  }
});

new Validall(IndicatorConfigValidators.CREATE_COMPUTATIONAL, {
  $ref: CREATE_BASE,
  $props: {
    equation: { $type: 'string', $required: true, $message: 'equationIsRequired' },
    match_by_columns: {
      $default: [],
      $each: {
        $each: { $type: 'string', $regex: /^[a-zA-Z]\..+/, $message: 'invalidMatchByElement' }
      }
    },
    args: {
      $is: 'notEmpty', $each: {
        $props: {
          argument_id: { $type: 'string', $required: true, $message: 'argumentIdIsRequired' },
          variable: { $type: 'string', $required: true, $regex: /^[a-zA-Z]$/, $message: 'variableIsRequired' },
        }
      }
    }
  }
});

new Validall(IndicatorConfigValidators.CREATE_VIEW, {
  $ref: CREATE_BASE,
  $props: {
    view_name: { $type: 'string', $required: true, $message: 'viewNameIsRequired' },
    additional_columns: { $default: [], $each: { $ref: ADDITIONAL_COLUMN } }
  }
});

new Validall(IndicatorConfigValidators.UPDATE, {
  $ref: CREATE_BASE,
  $props: {
    require_approval: { $type: 'number', $enum: [0,1], $default: 0 }
  }
});