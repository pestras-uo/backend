import dotenv from 'dotenv';

try {
  dotenv.config();
} catch (error) {
  console.log(".env file not found");
}

const config = {
  // env
  mode: process.env.NODE_ENV || "development",
  prod: process.env.NODE_ENV === "production",

  // server
  port: process.env.PORT || 3000,

  // session token
  tokenSecret: process.env.TOKEN_SECRET || "jiv8942yg4iu32j904g2v2249",
  apiTokenExpiry: +(process.env.API_TOKEN_EXP || 0) || 1000 * 60 * 60 * 24,
  rememberApiTokenExpiry: +(process.env.REMEMBER_API_TOKEN_EXP || 0) || 1000 * 60 * 60 * 24 * 60,
  emailTokenExpiry: +(process.env.EMAIL_TOKEN_EXP || 0) || 1000 * 60 * 60,
  passwordTokenExpiry: +(process.env.RESET_PASS_TOKEN_EXP || 0) || 1000 * 60 * 60,

  dbUsername: process.env.DB_USER,
  dbPassword: process.env.DB_PASS,
  dbUrl: process.env.DB_STR,

  // email config
  frontEndUrl: process.env.FRONTEND_URL,
  sendGridApiKey: process.env.SEND_GRID_API_KEY,

  // uplaod document config
  maxUploadSize: +(process.env.MAX_UPLOAD_SIZE || 0) || (1024 * 1024)
} as const;

export default config;