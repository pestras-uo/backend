import multer from 'multer';
import path from 'path';
import config from '../config';

const storage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, path.join(process.cwd(), 'public', 'upload'))
  },
  filename: function (_, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
});

export default multer({ storage, limits: { fileSize: config.maxUploadSize } })