import { createManualIndicator } from "./create-manual";
import { createExternalIndicator } from "./create-external";
import { createComputationalIndicator } from "./create-computational";
import { update, updateExternalIndicatorConfig, updateState } from "./update";
import { get } from "./read";
import { splitIndicator } from "./split";

export default {

  // getters
  // ----------------------------------------------------------------------
  get,




  // create manual indicator config
  // ----------------------------------------------------------------------
  createComputationalIndicator,
  createExternalIndicator,
  createManualIndicator,
  splitIndicator,




  // update
  // ---------------------------------------------------------------------------
  update,
  updateState,
  updateExternalIndicatorConfig
}