import path from 'path';

const config = {
  // env
  mode: process.env.NODE_ENV || "development",
  prod: process.env.NODE_ENV === "production",

  // server
  port: process.env.PORT || 3000,

  // session token
  tokenSecret: process.env.TOKEN_SECRET || "test",
  sessionTokenExpiry: +(process.env.SESSION_TOKEN_EXP || 0) || 1000 * 60 * 60 * 24,
  rememberSessionTokenExpiry: +(process.env.REMEMBER_SESSION_TOKEN_EXP || 0) || 1000 * 60 * 60 * 24 * 30,

  // database
  dbLibDir: process.env.DB_LIB_DIR,
  dbSystemUser: process.env.DB_SYSTEM_USER,
  dbSystemPass: process.env.DB_SYSTEM_PASS,
  dbReadingsUser: process.env.DB_READINGS_USER,
  dbReadingsPass: process.env.DB_READINGS_PASS,
  dbUrl: process.env.DB_STR,

  // upload files config
  uploadsDir: process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads'),
  maxDocumentUploadSize: +(process.env.MAX_DOC_UPLOAD_SIZE || 0) || (1024 * 1024),
  maxAvatarUploadSize: +(process.env.MAX_AVA_UPLOAD_SIZE || 0) || (1024 * 256)
} as const;

export default config;