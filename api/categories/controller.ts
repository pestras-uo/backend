import categoriesModel from '../../models/core/categories';
import { 
  CreateCategoryRequest, 
  GetAllCategoriesRequest, 
  GetCategoryByIdRequest, 
  updateCategoryRequest
} from "./interfaces";

export default {

  // getters
  // --------------------------------------------------------------------
  async getAll(req: GetAllCategoriesRequest) {
    req.res.json(await categoriesModel.getAll());
  },

  async get(req: GetCategoryByIdRequest) {
    req.res.json(await categoriesModel.get(req.params.id));
  },


  

  // create
  // --------------------------------------------------------------------
  async create(req: CreateCategoryRequest) {
    req.res.json(await categoriesModel.create(req.body.name_ar, req.body.name_en, req.body.parent));
  },




  // update
  // --------------------------------------------------------------------
  async update(req: updateCategoryRequest) {
    req.res.json(await categoriesModel.update(req.params.id, req.body.name_ar, req.body.name_en));
  }
}