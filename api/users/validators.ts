import { Validall } from "@pestras/validall";

const passwordRegex = /^[a-zA-Z0-9!@#$%^&*-_=+.|<>:;'"()]{8,64}$/;
const usernameRegex = /^[a-zA-Z0-9_-.]{8,64}$/;

enum UserValidators {
  CHANGE_USERNAME = "changeUsername",
  CHANGE_PASSWORD = "changePassword",
  UPDATE_PROFILE = "updateProfile",
  UPDATE_AVATAR = "updateAvatar",
}

new Validall(UserValidators.CHANGE_USERNAME, {
  username: { $type: 'string', $regex: usernameRegex, $required: true, $message: 'invalidUsername' }
});

new Validall(UserValidators.CHANGE_PASSWORD, {
  currentPassword: { $type: 'string', $required: true, $message: 'currentPasswordIsRequired' },
  newPassword: { $type: 'string', $regex: passwordRegex, $required: true, $message: 'invalidNewPassword' }
});

new Validall(UserValidators.UPDATE_PROFILE, {
  fullname: { $type: 'string', $is: 'name', $required: true, $message: 'firstnameIsRequired' },
  mobile: { $type: "string", $default: "" },
  email: { $type: "string", $is: 'email', $default: "" }
});

export default UserValidators;