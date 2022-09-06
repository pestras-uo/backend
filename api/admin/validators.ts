import { Validall } from "@pestras/validall";
import { RolesList } from "../../auth/roles";
import { UserTitle } from "../../models/user/doc";

const passwordRegex = /^[a-zA-Z0-9!@#$%^&*-_=+.|<>:;'"()]{8,64}$/;
const usernameRegex = /^[a-zA-Z0-9_-.]{8,64}$/;

enum AdminValidators {
  CREATE_USER = "createUser",
  UPDATE_USER_ROLES = "updateRoles",
  CHANGE_USER_ORG = "changeOrganization"
}

new Validall(AdminValidators.CREATE_USER, {
  organization: { $type: 'string', $required: true, $message: 'organizationIdIsRequired' },
  username: { $type: 'string', $regex: usernameRegex, $required: true, $message: "invalidUsername" },
  email: { $type: 'string', $is: 'email', $required: true, $message: 'invalidEmail' },
  password: { $type: 'string', $regex: passwordRegex, $required: true, $message: 'invalidPassword' },
  title: { $type: 'number', $enum: [UserTitle.MR, UserTitle.MS, UserTitle.MS], $default: UserTitle.MR },
  firstname: { $type: 'string', $is: 'name', $required: true, $message: 'firstnameIsRequired' },
  middlename: { $type: 'string', $is: 'name', $default: "" },
  lastname: { $type: 'string', $is: 'name', $required: true, $message: 'lastnameIsRequired' },
  mobiles: { $default: [], $each: { $type: "string" } },
  address: { $type: "string", $default: "" },
  pobox: { $type: "string", $default: "" },
  roles: {
    $required: true,
    $length: { $lt: RolesList.length },
    $message: "$rolesAreRequired",
    $each: {
      $type: 'string',
      $enum: RolesList as any,
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
      $type: 'string',
      $enum: RolesList as any,
      $message: "invalidRole"
    }
  }
});

new Validall(AdminValidators.CHANGE_USER_ORG, {
  organization: { $type: 'string', $required: true, $message: 'organizationIdIsRequired' }
});

export default AdminValidators;