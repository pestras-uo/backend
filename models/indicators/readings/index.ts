import { get, getById } from "./read";
import { exists } from "./util";
import { insert } from "./insert";
import { approve, update } from "./update";
import { addDocument, deleteDocument, getDocuments } from "./documents";

export default {

  // getters
  // --------------------------------------------------------------------------------------
  get,
  getById,
  getDocuments,




  // util
  // --------------------------------------------------------------------------------------
  exists,





  // Create
  // --------------------------------------------------------------------------------------
  insert,




  // update value
  // --------------------------------------------------------------------------------------
  update,
  approve,




  // documents
  // ----------------------------------------------------------------------------------------------------------------
  addDocument,
  deleteDocument

}