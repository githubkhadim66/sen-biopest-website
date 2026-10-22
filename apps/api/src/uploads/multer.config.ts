import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import { v4 as uuid } from 'uuid';

export const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
mkdirSync(UPLOAD_DIR, { recursive: true });

const IMAGE_TYPES = /^image\/(jpeg|png|webp|gif)$/;
const IMAGE_EXTENSIONS = /^\.(jpe?g|png|webp|gif)$/i;

export const imageUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${uuid()}${IMAGE_EXTENSIONS.test(ext) ? ext : ''}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (!IMAGE_TYPES.test(file.mimetype)) {
      return cb(new BadRequestException('Seules les images (JPEG, PNG, WebP, GIF) sont acceptées'), false);
    }
    cb(null, true);
  },
};
