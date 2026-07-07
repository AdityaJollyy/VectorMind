import multer from 'multer';
import { MAX_FILE_SIZE_BYTES } from '../config/constants';

const storage = multer.memoryStorage();

export const uploadSingle = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
}).single('file');
