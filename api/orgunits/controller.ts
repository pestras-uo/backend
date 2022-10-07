import pubSub from '../../misc/pub-sub';
import orgsModel from '../../models/core/orgunits';
import { 
  GetAllOrgunitsRequest, 
  GetOrgunitsByIdRequest, 
  CreateOrganziationRequest, 
  UpdateOrgunitRequest 
} from "./interfaces";

export default {
  async getAll(req: GetAllOrgunitsRequest) {
    req.res.json(await orgsModel.getAll());
  },

  async getById(req: GetOrgunitsByIdRequest) {
    req.res.json(await orgsModel.get(req.params.id));
  },

  async create(req: CreateOrganziationRequest) {
    const org = await orgsModel.create(req.body.name_ar, req.body.name_en, req.body.parent_id);
    req.res.json(org);

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entity_id: org.id,
      issuer: req.res.locals.user.id
    });
  },

  async update(req: UpdateOrgunitRequest) {
    req.res.json(await orgsModel.update(req.params.id, req.body.name_ar, req.body.name_en));

    pubSub.emit("publish", {
      action: req.res.locals.action,
      entity_id: req.params.id,
      issuer: req.res.locals.user.id
    });
  }
}