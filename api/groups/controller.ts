import groupsModel from '../../models/auth/groups';
import { CreateGroupRequest, GetAllGroupsRequest, GetGroupByIdRequest, UpdateGroupRequest } from './interfaces';

export default {

  // getters
  // ------------------------------------------------------------------------------------------
  async getAll(req: GetAllGroupsRequest) {
    req.res.json(await groupsModel.getAll());
  },

  async get(req: GetGroupByIdRequest) {
    req.res.json(await groupsModel.get(req.params.id));
  },



  
  // create
  // ------------------------------------------------------------------------------------------
  async create(req: CreateGroupRequest) {
    req.res.json(await groupsModel.create(req.body.name_ar, req.body.name_en))
  },



  
  // update
  // ------------------------------------------------------------------------------------------
  async update(req: UpdateGroupRequest) {
    req.res.json(await groupsModel.update(req.params.id, req.body.name_ar, req.body.name_en));
  }
}