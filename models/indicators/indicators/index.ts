import { updateCategories } from "./categories";
import { addDocument, deleteDocument, getDocuments } from "./documents";
import { create } from "./insert";
import { get, getByOrgunit, getByTopic, getIndicatorsWithProjection } from "./read";
import { activate, update, updateOrgunit, updateTopic } from "./update";
import { exists } from "./util";

export default {

  // Getters
  // ----------------------------------------------------------------------------
  get,
  getByTopic,
  getByOrgunit,
  getIndicatorsWithProjection,




  // Util
  // ----------------------------------------------------------------------------
  exists,




  // create
  // ----------------------------------------------------------------------------
  create,




  // update
  // ----------------------------------------------------------------------------
  update,
  updateOrgunit,
  updateTopic,
  activate,




  // category
  // ----------------------------------------------------------------------------
  updateCategories,




  // documents
  // ----------------------------------------------------------------------------------------------------------------
  getDocuments,
  addDocument,
  deleteDocument
}