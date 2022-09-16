import { Validall } from "@pestras/validall";
import { UserTitle } from "../../models/auth/user/interface";

const passwordRegex = /^[a-zA-Z0-9!@#$%^&*-_=+.|<>:;'"()]{8,64}$/;
const usernameRegex = /^[a-zA-Z0-9_-.]{8,64}$/;

enum UserValidators {
  CHANGE_USERNAME = "changeUsername",
  CHNAGE_EMAIL = "changeEmail",
  CHANGE_PASSWORD = "changePassword",
  UPDATE_PROFILE = "updateProfile"
}

new Validall(UserValidators.CHANGE_USERNAME, {
  username: { $type: 'string', $regex: usernameRegex, $required: true, $message: 'invalidUsername' }
});

new Validall(UserValidators.CHNAGE_EMAIL, {
  email: { $type: 'string', $is: "email", $required: true, $message: 'invalidEmail' },
  isBackup: { $type: 'boolean', $default: false }
});

new Validall(UserValidators.CHANGE_PASSWORD, {
  currentPassword: { $type: 'string', $required: true, $message: 'currentPasswordIsRequired' },
  newPassword: { $type: 'string', $regex: passwordRegex, $required: true, $message: 'invalidNewPassword' }
});

new Validall(UserValidators.UPDATE_PROFILE, {
  title: { $type: 'number', $enum: [UserTitle.MR, UserTitle.MS, UserTitle.MS], $default: UserTitle.MR },
  firstname: { $type: 'string', $is: 'name', $required: true, $message: 'firstnameIsRequired' },
  middlename: { $type: 'string', $is: 'name', $default: "" },
  lastname: { $type: 'string', $is: 'name', $required: true, $message: 'lastnameIsRequired' },
  mobiles: { $default: [], $each: { $type: "string" } },
  address: { $type: "string", $default: "" },
  pobox: { $type: "string", $default: "" }
});

export default UserValidators;