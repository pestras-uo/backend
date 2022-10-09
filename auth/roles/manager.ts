import { User } from "../../models/auth/user/interface";
import { RolesMap } from '.';
import { Action } from "./actions";
import { Group } from "../../models/auth/groups/interface";
import serial from "../../util/serial";
import { Request } from "express";
import { cache } from "../../cache";

export function actionsMatch(left: Action, right: Action) {
  const leftParts = left.split(".");
  const rightParts = right.split(".");
  const length = Math.max(leftParts.length, rightParts.length);

  for (let i = 0; i < length; i++) {
    if (leftParts[i] === "*" || rightParts[i] === "*")
      return true;
    if (leftParts?.[i] !== rightParts?.[i])
      return false;
  }

  return true;
}

export function anyActionMatch(actions: Action[], right: Action) {
  return actions.some(left => actionsMatch(left, right));
}

export function getTopRole(roles: number[]) {
  return roles.reduce((top, curr) => curr < top ? curr : top, roles[0]);
}

export function actionIs(action: Action, ...blocks: string[]) {
  for (const block of blocks)
    if (!action.includes(block))
      return false;

  return true;
}

export function authorizeGroups(action: Action, groups: Group[], orgunit_id: string) {
  for (const group of groups)
    if (serial.isAncs(group.orgunit_id, orgunit_id, true))
      if (group.roles.some(r => anyActionMatch(RolesMap.get(r), action)))
        return true;

  return false;
}

export function authorizeAction(action: Action, user: User, orgunit_id?: string) {
  if (orgunit_id)
    if (!serial.isAncs(user.orgunit_id, orgunit_id, true))
      return authorizeGroups(action, user.groups, orgunit_id)

  return user.roles.some(r => anyActionMatch(RolesMap.get(r), action));
}

export function authorize(action: Action, user: User, entity_id: string, payload?: { [key: string]: any }) {
  let orgunit_id: string;

  if (actionIs(action, 'users')) {
    if (actionIs(action, 'create')) {
      orgunit_id = payload.orgunit_id;

      if (getTopRole(user.roles) >= getTopRole(payload.roles))
        return false;

    } else if (entity_id) {
      const u = cache.users.get(entity_id);
      orgunit_id = u.orgunit_id;

      if (getTopRole(user.roles) >= getTopRole(u.roles))
        return false;

      if (actionIs(action, 'roles') && getTopRole(user.roles) >= getTopRole(payload.roles))
        return false;
    }

  } else if (actionIs(action, 'orgunits')) {
    if (actionIs(action, 'create'))
      orgunit_id = payload.parent_id;
    else
      orgunit_id = entity_id;

  } else if (actionIs(action, 'indicators') || actionIs(action, 'indicator')) {
    if (actionIs(action, "create"))
      orgunit_id = payload.orgunit_id;
    else if (entity_id)
      orgunit_id = cache.indicators.get(entity_id);

    // if action is update indicator orgunit we need to check both
    // current orgunit and new orgunit
    if (actionIs(action, "update", "orgunit") && !authorizeAction(action, user, orgunit_id))
        return false;
  }

  return authorizeAction(action, user, orgunit_id);
}