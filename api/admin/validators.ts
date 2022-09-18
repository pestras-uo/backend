import { Validall } from "@pestras/validall";
import { RolesList } from "../../auth/roles";

const passwordRegex = /^[a-zA-Z0-9!@#$%^&*-_=+.|<>:;'"()]{8,64}$/;
const usernameRegex = /^[a-zA-Z0-9_-.]{8,64}$/;

enum AdminValidators {
  CREATE_USER = "createUser",
  UPDATE_USER_ROLES = "updateUserRoles",
  CHANGE_USER_ORG = "changeOrganization",
  UPDATE_USER_GROUPS = "UpdateUserGroups"
};

new Validall(AdminValidators.CREATE_USER, {
  orgunit: { $type: "string", $required: true, $message: 'organizationIdIsRequired' },
  username: { $type: 'string', $regex: usernameRegex, $required: true, $message: "invalidUsername" },
  password: { $type: 'string', $regex: passwordRegex, $required: true, $message: 'invalidPassword' },
  roles: {
    $required: true,
    $length: { $gt: 0 },
    $message: "$rolesAreRequired",
    $each: {
      $type: 'number',
      $enum: RolesList.slice(1),
      $message: "invalidRole"
    }
  }
});

new Validall(AdminValidators.UPDATE_USER_ROLES, {
  roles: {
    $required: true,
    $length: { $lt: RolesList.length },
    $message: "$rolesAreRequired",
    $each: {
      $type: 'number',
      $enum: RolesList.slice(1),
      $message: "invalidRole"
    }
  }
});

new Validall(AdminValidators.CHANGE_USER_ORG, {
  orgunit: { $type: 'string', $required: true, $message: 'organizationIdIsRequired' }
});

new Validall(AdminValidators.UPDATE_USER_GROUPS, {
  groups: {
    $default: [],
    $each: {
      $type: 'string',
      $message: "invalidGroup"
    }
  }
});

export default AdminValidators;