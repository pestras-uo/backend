import { User } from '../models/auth/user/interface';
import usersModel from '../models/auth/user';
import { Group } from '../models/auth/groups/interface';
import groupsModel from '../models/auth/groups';
import indicatorsModel from '../models/indicators/indicators';
import pubSub from '../misc/pub-sub';
import { actionIs } from '../auth/roles/manager';

export interface Cache {
  users: Map<string, User>;
  groups: Map<string, Group>;
  indicators: Map<string, string>;
}

export const cache: Readonly<Cache> = {
  users: new Map<string, User>(),
  groups: new Map<string, Group>(),
  indicators: new Map<string, string>()
}

pubSub.on('dbConnected', async () => {
  (await usersModel.getAll()).map(u => cache.users.set(u.id, u));
  (await groupsModel.getAll()).map(g => cache.groups.set(g.id, g));
  (await indicatorsModel.getIndicatorsWithProjection(['orgunit_id'])).map(g => cache.indicators.set(g.id, g.orgunit_id));
});

pubSub.on('publish', async e => {
  if (actionIs(e.action, 'users')) {
    cache.users.set(e.entity_id, await usersModel.get(e.entity_id));
  }

  if (actionIs(e.action, 'groups')) {
    if (actionIs(e.action, 'delete'))
      cache.groups.delete(e.entity_id);
    else
      cache.groups.set(e.entity_id, await groupsModel.get(e.entity_id));
  }

  if (actionIs(e.action, 'indicators')) {
    cache.indicators.set(e.entity_id, (await indicatorsModel.get(e.entity_id))?.orgunit_id);
  }
});

