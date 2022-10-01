import { Validall } from "@pestras/validall";
import { IndicatorInterval, IndicatorType } from "../../../../models/indicators/config/interface";

export enum IndicatorConfigValidators {
  CREATE = 'createIndicatorConfig',
  UPDATE = 'updateIndicatorConfig'
}

const INVT = IndicatorInterval;

new Validall(IndicatorConfigValidators.CREATE, {
  type: { $type: 'number', $default: IndicatorType.MANUAL },
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

new Validall(IndicatorConfigValidators.UPDATE, {
  intervals: { 
    $type: 'number', 
    $enum: [INVT.MONTHLY, INVT.QUARTERLY, INVT.BIANNUAL, INVT.ANNUAL], 
    $default: INVT.ANNUAL, 
    $message: 'invalidIndicatorInterval' 
  },
  day: { $type: 'number', $inRange: [0, 28], $default: 1, $message: 'invalidEvaluationDay' },
  kpi_min: { $type: 'number', $nullable: true, $message: 'invalidKpiMin' },
  kpi_max: { $type: 'number', $nullable: true, $message: 'invalidKpiMax' }
});