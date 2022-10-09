import { Validall } from "@pestras/validall";
import { Role } from "../../auth/roles";

const passwordRegex = /^[a-zA-Z0-9!@#$%^&*-_=+.|<>:;'"()]{8,64}$/;
const usernameRegex = /^[a-zA-Z0-9_\-.]{4,64}$/;

enum AdminValidators {
  CREATE_USER = "createUser",
  UPDATE_USER_ROLES = "updateUserRoles",
  UPDATE_USER_GROUPS = "updateUserGroups",
  CHANGE_USER_ORG = "changeOrganization"
};

new Validall(AdminValidators.CREATE_USER, {
  orgunit: { $type: "string", $required: true, $message: 'organizationIdIsRequired' },
  username: { $type: 'string', $regex: usernameRegex, $required: true, $message: "invalidUsername" },
  password: { $type: 'string', $regex: passwordRegex, $required: true, $message: 'invalidPassword' },
  roles: {
    $required: true,
    $is: "notEmpty",
    $message: "$rolesAreRequired",
    $each: {
      $type: 'number',
      $inRange: [Role.ADMIN, Role.VIEWER],
      $message: "invalidRole"
    }
  },
  groups: {
    $default: [],
    $each: {
      $type: 'string',
      $message: "invalidGroup"
    }
  }
});

new Validall(AdminValidators.UPDATE_USER_ROLES, {
  roles: {
    $required: true,
    $is: "notEmpty",
    $message: "$rolesAreRequired",
    $each: {
      $type: 'number',
      $inRange: [Role.ADMIN, Role.VIEWER],
      $message: "invalidRole"
    }
  }
});

new Validall(AdminValidators.UPDATE_USER_GROUPS, {
  roles: {
    $default: [],
    $each: {
      $type: 'string',
      $message: "invalidGroup"
    }
  }
});

new Validall(AdminValidators.CHANGE_USER_ORG, {
  orgunit: { $type: 'string', $required: true, $message: 'organizationIdIsRequired' }
});

export default AdminValidators;