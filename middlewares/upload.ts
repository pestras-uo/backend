import multer from 'multer';
import path from 'path';
import config from '../config';
import { randomUUID } from 'crypto';
import { extension } from 'mime-types';

const documentsStorage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, path.join(process.cwd(), 'public', 'upload', 'documents'));
  },
  filename: function (_, file, cb) {
    cb(null, randomUUID() + "." + (extension(file.mimetype) || 'txt'));
  }
});

const avatarStorage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, path.join(process.cwd(), 'public', 'upload', 'avatars'));
  },
  filename: function (_, file, cb) {
    if (['jpeg', 'jpg'].includes(extension(file.mimetype) as string))
    cb(null, randomUUID() + "." + (extension(file.mimetype)));
  }
});

const documentUpload = multer({ storage: documentsStorage, limits: { fileSize: config.maxDocumentUploadSize } })
const avatarUpload = multer({ storage: avatarStorage, limits: { fileSize: config.maxAvatarUploadSize } })

export { documentUpload, avatarUpload };