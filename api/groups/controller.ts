import pubSub from '../../misc/pub-sub';
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
    const group = await groupsModel.create(req.body.name_ar, req.body.name_en);
    req.res.json(group);

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entity_id: group.id,
      issuer: req.res.locals.user.id
    });
  },



  
  // update
  // ------------------------------------------------------------------------------------------
  async update(req: UpdateGroupRequest) {
    req.res.json(await groupsModel.update(req.params.id, req.body.name_ar, req.body.name_en));

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entity_id: req.params.id,
      issuer: req.res.locals.user.id
    });
  }
}