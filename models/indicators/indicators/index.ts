import { getCategories, replaceCategories } from "./categories";
import { addDocument, deleteDocument, getDocuments } from "./documents";
import { getGroups, replaceGroups } from "./groups";
import { create } from "./insert";
import { get, getByOrgunit, getByTopic, getPage, getState } from "./read";
import { activate, update, updateManyState, updateOrgunit, updateState, updateTopic } from "./update";
import { exists } from "./util";

export default {

  // Getters
  // ----------------------------------------------------------------------------
  getPage,
  get,
  getByTopic,
  getByOrgunit,
  getState,




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
  updateState,
  updateManyState,




  // groups
  // ----------------------------------------------------------------------------------------------------------------
  getGroups,
  replaceGroups,




  // category
  // ----------------------------------------------------------------------------
  getCategories,
  replaceCategories,




  // documents
  // ----------------------------------------------------------------------------------------------------------------
  getDocuments,
  addDocument,
  deleteDocument
}