import { NextFunction, Request, Response } from "express";
import indConfigModel from '../../models/indicators/indicator-config';
import { CreateIndicatorConfigBody, UpdateIndicatorEquationBody, UpdateIndicatorIntervalBody, UpdateIndicatorKPIsBody } from "./interface";

export default {

  async get(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      res.json(await indConfigModel.get(req.params.id));
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request<any, any, CreateIndicatorConfigBody>, res: Response, next: NextFunction) {
    try {
      res.json(await indConfigModel.create({
        INDICATOR_ID: req.body.indicator_id,
        INTERVALS: req.body.intervals,
        KPI_MIN: req.body.kpi_min,
        KPI_MAX: req.body.kpi_max,
        READINGS_VIEW_NAME: req.body.readings_view_name,
        READING_DATE_COLUMN: req.body.reading_date_column,
        QANTITATIVE_COLUMNS: req.body.quantitative_columns.join(','),
        EQUATION: req.body.equation
      }, req.body.args));
    } catch (error) {
      next(error);
    }
  },

  async updateIntervals(req: Request<{ id: string }, any, UpdateIndicatorIntervalBody>, res: Response, next: NextFunction) {
    try {
      res.json(await indConfigModel.updateIntervals(req.params.id, req.body.intervals));
    } catch (error) {
      next(error);
    }
  },

  async updateKpis(req: Request<{ id: string }, any, UpdateIndicatorKPIsBody>, res: Response, next: NextFunction) {
    try {
      res.json(await indConfigModel.updateKpi(req.params.id, req.body.min, req.body.max));
    } catch (error) {
      next(error);
    }
  },

  async updateEquation(req: Request<{ id: string }, any, UpdateIndicatorEquationBody>, res: Response, next: NextFunction) {
    try {
      res.json(await indConfigModel.updateEquation(req.params.id, req.body.equation, req.body.args));
    } catch (error) {
      next(error);
    }
  }
}