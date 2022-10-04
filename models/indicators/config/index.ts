import { createManualIndicator } from "./create-munual";
import { createViewIndicator } from "./create-view";
import { createComputationalIndicator } from "./create-computational";
import { update } from "./update";
import { get } from "./read";
import { getArgumentIndicators, getArguments } from "./arguments";
import { getAdditionalColumns } from "./util";

export default {

  // getters
  // ----------------------------------------------------------------------
  get,
  getAdditionalColumns,




  // create manual indicator config
  // ----------------------------------------------------------------------
  createComputationalIndicator,
  createViewIndicator,
  createManualIndicator,




  // update
  // ---------------------------------------------------------------------------
  update,




  // arguments
  // ---------------------------------------------------------------------------
  getArguments,
  getArgumentIndicators
}