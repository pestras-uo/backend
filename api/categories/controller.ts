import pubSub from '../../misc/pub-sub';
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
    const cat = await categoriesModel.create(req.body.name_ar, req.body.name_en, req.body.type, req.body.parent)
    req.res.json(cat);

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entities_ids: [cat.id],
      issuer: req.res.locals.user.id
    });
  },




  // update
  // --------------------------------------------------------------------
  async update(req: updateCategoryRequest) {
    req.res.json(await categoriesModel.update(req.params.id, req.body.name_ar, req.body.name_en));

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entities_ids: [req.params.id],
      issuer: req.res.locals.user.id
    });
  }
}