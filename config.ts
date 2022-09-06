import dotenv from 'dotenv';

try {
  dotenv.config();
} catch (error) {
  console.log(".env file not found");
}

const config = {
  mode: process.env.NODE_ENV || "development",
  prod: process.env.NODE_ENV === "production",
  port: process.env.PORT || 3000,
  tokenSecret: process.env.TOKEN_SECRET || "jiv8942yg4iu32j904g2v2249",
  apiTokenExpiry: +(process.env.API_TOKEN_EXPIRY || 0) || 1000 * 60 * 60 * 1,
  rememberApiTokenExpiry: +(process.env.API_TOKEN_EXPIRY || 0) || 1000 * 60 * 60 * 30,
  emailTokenExpiry: +(process.env.API_TOKEN_EXPIRY || 0) || 1000 * 60 * 60 * 1,
  passwordTokenExpiry: +(process.env.API_TOKEN_EXPIRY || 0) || 1000 * 60 * 60 * 1,
  dbUrl: process.env.DB_URL,
  frontEndUrl: process.env.FRONTEND_URL,
  sendGridApiKey: process.env.SG_API_KEY,
  maxUploadSize: +(process.env.MAX_UPLOAD_SIZE || 0) || (1024 * 1024)
} as const;

export default config;