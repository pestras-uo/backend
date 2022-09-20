import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config';
import { randomUUID } from 'crypto';
import { extension } from 'mime-types';
import { Request } from 'express';

const docsStorage = multer.diskStorage({
  destination: function (req: Request, __, cb) {
    const dir = path.join(process.cwd(), 'public', 'uploads', 'system', req.params.id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (_, file, cb) {
    cb(null, randomUUID() + "." + (extension(file.mimetype) || 'txt'));
  }
});

const readingsDocsStorage = multer.diskStorage({
  destination: function (req: Request, __, cb) {
    const dir = path.join(process.cwd(), 'public', 'uploads', 'readings', req.params.id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (_, file, cb) {
    cb(null, randomUUID() + "." + (extension(file.mimetype) || 'txt'));
  }
});

const avatarStorage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, path.join(process.cwd(), 'public', 'uploads', 'avatars'));
  },
  filename: function (_, file, cb) {
    if (['jpeg', 'jpg'].includes(extension(file.mimetype) as string))
    cb(null, randomUUID() + "." + (extension(file.mimetype)));
  }
});

const sysDocUpload = multer({ storage: docsStorage, limits: { fileSize: config.maxDocumentUploadSize } });
const ReadingDocUpload = multer({ storage: readingsDocsStorage, limits: { fileSize: config.maxDocumentUploadSize } });
const avatarUpload = multer({ storage: avatarStorage, limits: { fileSize: config.maxAvatarUploadSize } });

export { sysDocUpload, ReadingDocUpload, avatarUpload };