import multer from 'multer';
import path from 'path';
import { generateId, sanitizeFilename } from '../shared/utils.js';
import { BadRequestError } from '../shared/errors.js';
import { env } from '../config/index.js';

const ALLOWED_MIME_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitized = sanitizeFilename(file.originalname.replace(ext, ''));
    cb(null, `${generateId()}-${sanitized}${ext}`);
  },
});

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Invalid file type: ${file.mimetype}. Only PDF files are allowed.`));
  }
}

export const uploadDrawing = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('drawing');

export const uploadMultipleDrawings = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
}).array('drawings', 10);
