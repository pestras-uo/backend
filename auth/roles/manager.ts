import { UserDetails } from "../../models/auth/user/interface";
import { RolesMap } from '.';
import { Action } from "./actions";

export default {
  hasRoleId(user: UserDetails, role: number) {
    return user.roles.includes(role);
  },

  hasAction(user: UserDetails, action: Action) {
    const actionParts = action.split('.');
    for (const role of user.roles) {

      for (const roleAction of RolesMap.get(role)!) {
        const roleActionParts = roleAction.split('.');
        const length = actionParts.length > roleActionParts.length ? actionParts.length : roleActionParts.length;

        for (let i = 0; i < length; i++) {
          if (roleActionParts[i] === "*")
            return true;
          if (roleActionParts[i] !== actionParts[i])
            return false;
        }
      }
    }

    return true;
  },

  getTopRole(roles: number[]) {
    return roles.reduce((top, curr) => curr < top ? curr : top, roles[0]);
  },

  authorize(user: UserDetails, action: Action, affected?: UserDetails) {
    if (affected && this.getTopRole(user.roles) >= this.getTopRole(affected.roles))
      return false;

    if (this.hasAction(user, action))
      return true;

    return false;
  },

  actionHas(action: Action, ...blocks: string[]) {
    for (const block of blocks)
      if (!action.includes(block))
        return false;

    return true;
  }

} as const;