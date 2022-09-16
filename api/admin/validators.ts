import { Validall } from "@pestras/validall";
import { RolesList } from "../../auth/roles";

const passwordRegex = /^[a-zA-Z0-9!@#$%^&*-_=+.|<>:;'"()]{8,64}$/;
const usernameRegex = /^[a-zA-Z0-9_-.]{8,64}$/;

enum AdminValidators {
  CREATE_USER = "createUser",
  UPDATE_USER_ROLES = "updateRoles",
  CHANGE_USER_ORG = "changeOrganization"
}

new Validall(AdminValidators.CREATE_USER, {
  orgunit: { $type: "number", $required: true, $message: 'organizationIdIsRequired' },
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
  orgunit: { $type: 'number', $required: true, $message: 'organizationIdIsRequired' }
});

export default AdminValidators;