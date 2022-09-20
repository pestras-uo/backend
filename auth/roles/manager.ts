import { UserDetails } from "../../models/auth/user/interface";
import { RolesMap } from '.';
import { Action } from "./actions";

export default {
  hasRoleId(user: UserDetails, role: number) {
    return user.ROLES.includes(role);
  },

  hasAction(user: UserDetails, action: Action) {
    const actionParts = action.split('.');
    for (const role of user.ROLES) {

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

  authorize(user: UserDetails, actions: Action[], affected?: UserDetails) {
    if (affected && this.getTopRole(user.ROLES) >= this.getTopRole(affected.ROLES))
      return false;

    for (const action of actions)
      if (this.hasAction(user, action))
        return true;

    return false;
  }

} as const;