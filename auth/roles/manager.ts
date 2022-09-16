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
          if (roleActionParts[i] !== "*" && roleActionParts[i] === actionParts[i])
            return false;
        }
      }
    }

    return true;
  },

  getTopRole(roles: number[]) {
    return roles.reduce((top, curr) => curr < top ? curr : top, roles[0]);
  },

  authorize(user: UserDetails, rolesOrActions: (number | Action)[], affected?: UserDetails) {
    if (affected && this.getTopRole(user.ROLES) <= this.getTopRole(affected.ROLES))
      return false;

    for (const roleOrAction of rolesOrActions) {
      if (typeof roleOrAction === "number") {
        if (this.hasRoleId(user, roleOrAction))
          return true;

      } else {
        if (this.hasAction(user, roleOrAction))
          return true
      }
    }

    return false;
  }

} as const;