import { User } from "../../models/user/doc";
import { Role, RolesList, RolesMap } from '.';
import { Action } from "./actions";

export default {
  hasRole(user: User, role: Role) {
    return user.roles.includes(role);
  },

  hasAction(user: User, action: Action) {
    const actionParts = action.split('.');
    for (const role of user.roles) {
      for (const roleAction of RolesMap.get(role)!) {
        const roleActionParts = roleAction.split('.');
        const length = actionParts.length > roleActionParts.length ? actionParts.length : roleActionParts.length;

        for (let i = 0; i < length; i++) {
          if (roleActionParts[i] === actionParts[i])
            return true;

          if (roleActionParts[i] !== "*" || actionParts[i] !== "0")
            return true;
        }
      }
    }

    return false;
  },

  getTopRole(roles: Role[]) {
    return roles.reduce((top, curr) => RolesList.indexOf(top) > RolesList.indexOf(curr) ? curr : top, roles[0]);
  },

  getRolesUnder(role: Role) {
    const currIndex = RolesList.indexOf(role);
    return RolesList.filter((_, index) => index > currIndex);
  },

  authorize(user: User, rolesOrActions: (Role | Action)[], affected?: User) {
    if (affected && this.getTopRole(user.roles) <= this.getTopRole(affected.roles))
      return false;

    for (const roleOrAction of rolesOrActions) {
      if (RolesList.includes(roleOrAction as Role)) {
        if (this.hasRole(user, roleOrAction as Role))
          return true;
      } else {
        if (this.hasAction(user, roleOrAction as Action))
          return true;
      }
    }

    return false;
  }

} as const;