import pubSub from '../../misc/pub-sub';
import groupsModel from '../../models/auth/groups';
import { CreateGroupRequest, GetAllGroupsRequest, GetGroupByIdRequest, UpdateGroupRolesRequest, UpdateGroupOrgunitRequest, UpdateGroupRequest } from './interfaces';

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
    const group = await groupsModel.create(req.body.orgunit_id, req.body.name_ar, req.body.name_en, req.body.roles);
    req.res.json(group);

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entities_ids: [group.id],
      issuer: req.res.locals.user.id
    });
  },



  
  // update
  // ------------------------------------------------------------------------------------------
  async update(req: UpdateGroupRequest) {
    req.res.json(await groupsModel.update(req.params.id, req.body.name_ar, req.body.name_en));

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entities_ids: [req.params.id],
      issuer: req.res.locals.user.id
    });
  },

  async updateRoles(req: UpdateGroupRolesRequest) {
    req.res.json(await groupsModel.updateRoles(req.params.id, req.body.roles));

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entities_ids: [req.params.id],
      issuer: req.res.locals.user.id
    });
  },



  
  // update orgunit
  // ------------------------------------------------------------------------------------------
  async updateOrgunit(req: UpdateGroupOrgunitRequest) {
    req.res.json(await groupsModel.updateGroupOrgunit(req.params.id, req.body.orgunit_id));

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entities_ids: [req.params.id],
      issuer: req.res.locals.user.id
    });
  }
}