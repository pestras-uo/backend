import { getCategories, replaceCategories } from "./categories";
import { addDocument, deleteDocument, getDocuments } from "./documents";
import { getGroups, replaceGroups } from "./groups";
import { create } from "./insert";
import { get, getByOrgunit, getByTopic, getPage } from "./read";
import { getTags, replaceTags } from "./tags";
import { activate, update, updateOrgunit, updateTopic } from "./update";
import { exists, nameExists, updatedNameExists } from "./util";

export default {

  // Getters
  // ----------------------------------------------------------------------------
  getPage,
  get,
  getByTopic,
  getByOrgunit,




  // Util
  // ----------------------------------------------------------------------------
  exists,
  nameExists,
  updatedNameExists,




  // create
  // ----------------------------------------------------------------------------
  create,




  // update
  // ----------------------------------------------------------------------------
  update,
  updateOrgunit,
  updateTopic,
  activate,




  // groups
  // ----------------------------------------------------------------------------------------------------------------
  getGroups,
  replaceGroups,




  // category
  // ----------------------------------------------------------------------------
  getCategories,
  replaceCategories,




  // tags
  // ----------------------------------------------------------------------------
  getTags,
  replaceTags,




  // documents
  // ----------------------------------------------------------------------------------------------------------------
  getDocuments,
  addDocument,
  deleteDocument
}