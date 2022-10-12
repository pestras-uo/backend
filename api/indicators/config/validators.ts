import { Validall } from "@pestras/validall";
import { ColumnType, IndicatorInterval } from "../../../models/indicators/config/interface";

export enum IndicatorConfigValidators {
  CREATE_MANUAL = 'createManualIndicatorConfig',
  CREATE_COMPUTATIONAL = 'createComputaionalIndicatorConfig',
  CREATE_EXTERNAL = 'createViewIndicatorConfig',
  SPLIT = 'splitIndicator',
  UPDATE = 'updateIndicatorConfig',
  UPDATE_EXTERNAL = 'updateExternalIndicatorConfig',
}

const INVT = IndicatorInterval;

const ADDITIONAL_COLUMN = 'additionalColumnSchema';

new Validall(ADDITIONAL_COLUMN, {
  column_name: { $type: 'string', $required: true, $message: 'columnNameIsRequired' },
  type: { $type: 'number', $inRange: [ColumnType.NUMBER, ColumnType.DATE], $default: ColumnType.TEXT },
  category_id: { $type: 'string', $nullable: true },
  name_ar: { $type: 'string', $required: true, $message: 'nameArIsRequired' },
  name_en: { $type: 'string', $required: true, $message: 'nameEnIsRequired' }
});

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
  kpi_min: { $type: 'number', $nullable: true, $message: 'invalidKpiMin' },
  kpi_max: { $type: 'number', $nullable: true, $message: 'invalidKpiMax' }
});



new Validall(IndicatorConfigValidators.CREATE_MANUAL, {
  $ref: CREATE_BASE,
  $props: {
    evaluation_day: { $type: 'number', $inRange: [1, 28], $default: 1, $message: 'invalidEvaluationDay' },
    require_approval: { $type: 'number', $enum: [0,1], $default: 0 },
    columns: { $default: [], $each: { $ref: ADDITIONAL_COLUMN } }
  }
});

new Validall(IndicatorConfigValidators.CREATE_COMPUTATIONAL, {
  $ref: CREATE_BASE,
  $props: {
    evaluation_day: { $type: 'number', $inRange: [1, 28], $default: 1, $message: 'invalidEvaluationDay' },
    compute_options: {
      $props: {
        equation: { $type: 'string', $required: true, $message: 'equationIsRequired' },
        join_on: { $default: [], $each: { $tuple: [{ $type: "string" }, { $type: "string" }] } },
        arguments: {
          $is: "notEmpty",
          $each: {
            $props: {
              id: { $type: 'string', $required: true, $message: 'argumentIdIsRequired' },
              variable: { $type: 'string', $required: true, $message: 'argumentVariableIsRequired' }
            }
          }
        }
      }
    }
  }
});

new Validall(IndicatorConfigValidators.CREATE_EXTERNAL, {
  $ref: CREATE_BASE,
  $props: {
    source_name: { $type: 'string', $required: true, $message: 'viewNameIsRequired' },
    reading_value_column_name: { $type: "string", $required: true, $message: "readingValueColumnNameIsRequired" },
    columns: { $default: [], $each: { $ref: ADDITIONAL_COLUMN } }
  }
});

new Validall(IndicatorConfigValidators.UPDATE, {
  $ref: CREATE_BASE,
  $props: {
    require_approval: { $type: 'number', $enum: [0,1], $default: 0 }
  }
});

new Validall(IndicatorConfigValidators.SPLIT, {
  categorial_column: { $type: 'string', $required: true, $message: 'categorialColumnIsRequired' }
});

new Validall(IndicatorConfigValidators.UPDATE_EXTERNAL, {
  source_name: { $type: 'string', $required: true, $message: 'sourceNameIsRequired' },
  columns: { $default: [], $each: { $ref: ADDITIONAL_COLUMN } }
});