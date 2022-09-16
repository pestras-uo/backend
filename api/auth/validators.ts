import { Validall } from '@pestras/validall';
import { UserTitle } from '../../models/auth/user/interface';

const passwordRegex = /^[a-zA-Z0-9!@#$%^&*-_=+.|<>:;'"()]{8,64}$/;
const usernameRegex = /^[a-zA-Z0-9_-.]{8,64}$/;

enum AuthValidators {
  LOGIN = "login",
  RESET_PASSWORD = "resetPassword",
  SIGNUP = "signup",
  RESEND_ACTIVATION_EMAIL = "resendActiviationEmail"
}

new Validall(AuthValidators.LOGIN, {
  usernameOrEmail: { $type: 'string', $required: true, $message: "usernameOrEmailIsRequired" },
  password: { $type: 'string', $required: true, $message: "passwordIsRequired" },
  remember: { $type: 'boolean', $default: false }
});

new Validall(AuthValidators.RESET_PASSWORD, {
  password: { $type: 'string', $regex: passwordRegex, $required: true, $message: "invalidPassword" }
});

signup: new Validall(AuthValidators.SIGNUP, {
  organziation: { $type: "string", $required: true, $message: "organizationIsRequired" },
  username: { $type: 'string', $regex: usernameRegex, $required: true, $message: 'invalidUsername' },
  email: { $type: 'string', $is: 'email', $required: true, $message: 'invalidEnail' },
  password: { $type: 'string', $regex: passwordRegex, $required: true, $message: "invalidPassword" },
  firstname: { $type: 'string', $is: 'name', $required: true, $message: "firstnameIsRequired" },
  lastname: { $type: 'string', $is: 'name', $required: true, $message: "lastnameIsRequired" },
  title: { $type: 'number', $enum: [UserTitle.MR, UserTitle.MS, UserTitle.MS], $default: UserTitle.MR }
});

new Validall(AuthValidators.RESEND_ACTIVATION_EMAIL, {
  email: { $type: 'string', $is: 'email', $required: true, $message: "emailIsRequired" },
  password: { $type: 'string', $required: true, $message: "passwordIsRequired" }
});

export default AuthValidators;