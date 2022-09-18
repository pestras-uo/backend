import { Validall } from '@pestras/validall';

const passwordRegex = /^[a-zA-Z0-9!@#$%^&*-_=+.|<>:;'"()]{8,64}$/;

enum AuthValidators {
  LOGIN = "login",
  RESET_PASSWORD = "resetPassword"
}

new Validall(AuthValidators.LOGIN, {
  username: { $type: 'string', $required: true, $message: "usernameIsRequired" },
  password: { $type: 'string', $required: true, $message: "passwordIsRequired" },
  remember: { $type: 'boolean', $default: false }
});

export default AuthValidators;